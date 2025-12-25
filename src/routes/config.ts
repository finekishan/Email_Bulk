// src/routes/config.ts - UPDATED FOR MONGODB
import { Hono } from "hono";
import { mongoDatabase } from "../services/mongoDatabase";
import { getUser } from "../middleware/auth";

// Global environment config (fallback for admin or demo mode)
const envConfig = {
  host: process.env.SMTP_HOST || "",
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
  secure: process.env.SMTP_SECURE === "true",
  user: process.env.SMTP_USER || "",
  pass: process.env.SMTP_PASS || "",
  fromEmail: process.env.FROM_EMAIL || "",
  fromName: process.env.FROM_NAME || "",
};

const hasEnvConfig = !!(
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
);

const app = new Hono();

// GET active config for sending emails (must come before /:configId routes)
app.get("/smtp/active", async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ success: false, message: "Authentication required" }, 401);
  }

  const defaultConfig = await mongoDatabase.getDefaultSMTPConfig(user.id);
  const activeConfig = defaultConfig
    ? {
        host: defaultConfig.host,
        port: defaultConfig.port,
        secure: !!defaultConfig.secure,
        user: defaultConfig.user,
        pass: defaultConfig.pass,
        fromEmail: defaultConfig.from_email,
        fromName: defaultConfig.from_name,
      }
    : hasEnvConfig
    ? envConfig
    : null;

  return c.json({
    success: true,
    data: activeConfig,
    mode: defaultConfig ? "user" : "env",
    configId: defaultConfig?.id,
    configName: defaultConfig?.name,
  });
});

// POST - Test SMTP connection (must come before /:configId routes)
app.post("/smtp/test", async (c) => {
  try {
    const user = getUser(c);
    if (!user) {
      return c.json({ success: false, message: "Authentication required" }, 401);
    }
    const body = await c.req.json();

    // Import email service for testing
    const { emailService } = await import("../services/emailService");

    const testConfig = {
      host: body.host,
      port: body.port || 587,
      secure: !!body.secure,
      auth: {
        user: body.user,
        pass: body.pass,
      },
    };

    const isValid = await emailService.testConnection(testConfig);

    return c.json({
      success: isValid,
      message: isValid
        ? "✅ SMTP connection successful"
        : "❌ SMTP connection failed",
    });
  } catch (error) {
    console.error("SMTP test error:", error);
    return c.json(
      {
        success: false,
        message: "❌ SMTP connection test failed",
      },
      500
    );
  }
});

// GET user's SMTP configurations
app.get("/smtp", async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ success: false, message: "Authentication required" }, 401);
  }

  // Get all user configurations
  const userConfigs = await mongoDatabase.getSMTPConfigs(user.id);
  const defaultConfig = await mongoDatabase.getDefaultSMTPConfig(user.id);

  // Convert UserSMTPConfig to SMTPDefaults format for compatibility
  const activeConfig = defaultConfig
    ? {
        host: defaultConfig.host,
        port: defaultConfig.port,
        secure: !!defaultConfig.secure,
        user: defaultConfig.user,
        pass: defaultConfig.pass,
        fromEmail: defaultConfig.from_email,
        fromName: defaultConfig.from_name,
      }
    : hasEnvConfig
    ? envConfig
    : null;

  return c.json({
    success: true,
    data: activeConfig,
    hasConfig: !!activeConfig,
    hasEnvConfig,
    currentMode: defaultConfig ? "user" : "env",
    envConfig: hasEnvConfig ? envConfig : null,
    userConfigs: userConfigs.map((config) => ({
      id: config.id,
      name: config.name,
      host: config.host,
      port: config.port,
      secure: !!config.secure,
      user: config.user,
      fromEmail: config.from_email,
      fromName: config.from_name,
      isDefault: !!config.is_default,
      createdAt: config.created_at,
    })),
    userId: user.id,
    userName: user.name,
  });
});

// POST - Create new SMTP configuration for user
app.post("/smtp", async (c) => {
  try {
    const user = getUser(c);
    if (!user) {
      return c.json({ success: false, message: "Authentication required" }, 401);
    }
    const body = await c.req.json();

    const configData = {
      name: body.name || "Default Configuration",
      host: body.host,
      port: body.port || 587,
      secure: !!body.secure,
      user: body.user,
      pass: body.pass,
      from_email: body.fromEmail,
      from_name: body.fromName || "",
      is_default: !!body.isDefault,
    };

    // Validate required fields
    if (
      !configData.host ||
      !configData.user ||
      !configData.pass ||
      !configData.from_email
    ) {
      return c.json(
        {
          success: false,
          message:
            "Missing required fields: host, user, password, and from_email are required",
        },
        400
      );
    }

    const configId = await mongoDatabase.createSMTPConfig(user.id, configData);

    console.log(
      `📧 SMTP config created for user ${user.email}: ${configData.name}`
    );

    return c.json({
      success: true,
      data: { ...configData, id: configId },
      message: "✅ SMTP configuration saved successfully",
      configId,
    });
  } catch (error) {
    console.error("Error creating SMTP config:", error);
    return c.json(
      {
        success: false,
        message: "❌ Failed to save SMTP configuration",
      },
      500
    );
  }
});

// POST - Set default configuration
app.post("/smtp/:configId/default", async (c) => {
  try {
    const user = getUser(c);
    if (!user) {
      return c.json({ success: false, message: "Authentication required" }, 401);
    }
    const configId = c.req.param("configId");

    await mongoDatabase.updateSMTPConfig(configId, user.id, {
      isDefault: true,
    });

    return c.json({
      success: true,
      message: "✅ Default configuration updated",
    });
  } catch (error) {
    console.error("Error setting default config:", error);
    return c.json(
      {
        success: false,
        message: "❌ Failed to set default configuration",
      },
      500
    );
  }
});

// PUT - Update existing SMTP configuration
app.put("/smtp/:configId", async (c) => {
  try {
    const user = getUser(c);
    if (!user) {
      return c.json({ success: false, message: "Authentication required" }, 401);
    }
    const configId = c.req.param("configId");
    const body = await c.req.json();

    const updates = {
      name: body.name,
      host: body.host,
      port: body.port,
      secure: body.secure,
      user: body.user,
      pass: body.pass,
      from_email: body.fromEmail,
      from_name: body.fromName,
      is_default: body.isDefault,
    };

    // Remove undefined values
    Object.keys(updates).forEach((key) => {
      if (updates[key as keyof typeof updates] === undefined) {
        delete updates[key as keyof typeof updates];
      }
    });

    await mongoDatabase.updateSMTPConfig(configId, user.id, updates);

    console.log(`📧 SMTP config updated for user ${user.email}: ${configId}`);

    return c.json({
      success: true,
      message: "✅ SMTP configuration updated successfully",
    });
  } catch (error) {
    console.error("Error updating SMTP config:", error);
    return c.json(
      {
        success: false,
        message: "❌ Failed to update SMTP configuration",
      },
      500
    );
  }
});

// DELETE - Delete SMTP configuration
app.delete("/smtp/:configId", async (c) => {
  try {
    const user = getUser(c);
    if (!user) {
      return c.json({ success: false, message: "Authentication required" }, 401);
    }
    const configId = c.req.param("configId");

    await mongoDatabase.deleteSMTPConfig(configId, user.id);

    console.log(`🗑️ SMTP config deleted for user ${user.email}: ${configId}`);

    return c.json({
      success: true,
      message: "✅ SMTP configuration deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting SMTP config:", error);
    return c.json(
      {
        success: false,
        message: "❌ Failed to delete SMTP configuration",
      },
      500
    );
  }
});

export default app;
