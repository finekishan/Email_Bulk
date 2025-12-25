// src/routes/send.ts
import { Hono } from "hono";
import { mongoDatabase } from "../services/mongoDatabase";
import { emailService } from "../services/emailService";
import { FileService } from "../services/fileService";
import { getUser } from "../middleware/auth";
import type { EmailJob, EmailConfig } from "../types";

const app = new Hono();

app.post("/", async (c) => {
  try {
    const user = getUser(c);
    if (!user) {
      return c.json({ success: false, message: "Authentication required" }, 401);
    }
    const formData = await c.req.formData();

    const subject = formData.get("subject") as string;
    const htmlContent = formData.get("htmlContent") as string;
    const delay = parseInt(formData.get("delay") as string) || 2;
    const excelFile = formData.get("excelFile") as File;

    // Get user's default SMTP config or use env config
    let smtpConfig = await mongoDatabase.getDefaultSMTPConfig(user.id);
    
    // Fallback to environment variables if no user config
    if (!smtpConfig && process.env.SMTP_HOST) {
      smtpConfig = {
        id: 'env-default',
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        from_email: process.env.FROM_EMAIL,
        from_name: process.env.FROM_NAME,
        is_default: true,
        created_at: new Date()
      };
    }
    
    if (!smtpConfig) {
      return c.json({
        success: false,
        message: "No SMTP configuration found. Please add one in Config page or set .env variables."
      }, 400);
    }

    // Validate inputs
    if (!subject || !htmlContent || !excelFile) {
      return c.json({
        success: false,
        message: "Subject, content, and Excel file are required"
      }, 400);
    }

    // Parse Excel file
    const arrayBuffer = await excelFile.arrayBuffer();
    const filename = `${Date.now()}_${excelFile.name}`;
    const filePath = await FileService.saveUploadedFile(new Uint8Array(arrayBuffer), filename);
    const contacts = await FileService.parseExcelFile(filePath);

    if (contacts.length === 0) {
      return c.json({
        success: false,
        message: "No contacts found in Excel file"
      }, 400);
    }

    // Create email config
    const emailConfig: EmailConfig = {
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass
      }
    };

    // Test connection (skip for now)
    // const connectionValid = await emailService.testConnection(emailConfig);
    // if (!connectionValid) {
    //   return c.json({
    //     success: false,
    //     message: "SMTP connection failed. Please check your configuration."
    //   }, 400);
    // }

    // Create email job
    const emailJob: EmailJob = {
      contacts,
      htmlContent,
      subject,
      fromEmail: smtpConfig.from_email || smtpConfig.fromEmail,
      fromName: (smtpConfig.from_name || smtpConfig.fromName) || (smtpConfig.from_email || smtpConfig.fromEmail),
      config: emailConfig,
      delay
    };

    // Send emails in background
    emailService.createTransport(emailConfig);
    
    // Start sending (async) with proper logging
    (async () => {
      for (const contact of contacts) {
        const personalizedSubject = emailService.replaceVariables(subject, contact);
        const personalizedHtml = emailService.replaceVariables(htmlContent, contact);
        
        const success = await emailService.sendEmail(
          contact.Email,
          personalizedSubject,
          personalizedHtml,
          smtpConfig.from_email || smtpConfig.fromEmail,
          smtpConfig.from_name || smtpConfig.fromName || (smtpConfig.from_email || smtpConfig.fromEmail)
        );
        
        await mongoDatabase.saveEmailLog(user.id, {
          email: contact.Email,
          status: success ? 'Sent' : 'Failed',
          subject,
          timestamp: new Date()
        });
        
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay * 1000));
        }
      }
    })().catch(error => {
      console.error('Bulk email error:', error);
    });

    return c.json({
      success: true,
      message: `Email sending started for ${contacts.length} contacts`,
      contactCount: contacts.length
    });

  } catch (error: any) {
    console.error('Send error:', error);
    return c.json({
      success: false,
      message: error.message || "Failed to send emails"
    }, 500);
  }
});

app.get("/batch-status", (c) => {
  return c.json({ 
    success: true, 
    data: { isRunning: false, currentJob: null } 
  });
});

export default app;
