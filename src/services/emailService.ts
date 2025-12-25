// src/services/emailService.ts
import nodemailer from 'nodemailer';
import type { EmailConfig, EmailJob, Contact } from '../types';

class EmailService {
  private transporter: any = null;

  createTransport(config: EmailConfig) {
    this.transporter = nodemailer.createTransport(config);
  }

  async testConnection(config: EmailConfig): Promise<boolean> {
    try {
      const testTransporter = nodemailer.createTransport(config);
      await testTransporter.verify();
      return true;
    } catch (error) {
      console.error('SMTP connection test failed:', error);
      return false;
    }
  }

  replaceVariables(template: string, contact: Contact): string {
    let result = template;
    Object.keys(contact).forEach(key => {
      const value = contact[key] || '';
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return result;
  }

  async sendEmail(to: string, subject: string, html: string, from: string, fromName: string): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: `"${fromName}" <${from}>`,
        to,
        subject,
        html
      });
      return true;
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
      return false;
    }
  }

  async sendBulkEmails(job: EmailJob, onProgress?: (sent: number, failed: number) => void): Promise<void> {
    let sent = 0;
    let failed = 0;

    for (const contact of job.contacts) {
      const personalizedSubject = this.replaceVariables(job.subject, contact);
      const personalizedHtml = this.replaceVariables(job.htmlContent, contact);

      const success = await this.sendEmail(
        contact.Email,
        personalizedSubject,
        personalizedHtml,
        job.fromEmail,
        job.fromName
      );

      if (success) {
        sent++;
      } else {
        failed++;
      }

      if (onProgress) {
        onProgress(sent, failed);
      }

      // Delay between emails
      if (job.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, job.delay * 1000));
      }
    }
  }
}

export const emailService = new EmailService();
