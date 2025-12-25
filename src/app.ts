// src/app.ts - UPDATED WITH MONGODB AND NODE.JS
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";
import { config } from "dotenv";
import { mongoDatabase } from "./services/mongoDatabase";

// Import middleware
import { authMiddleware } from "./middleware/auth";

// Import routes
import indexRoutes from "./routes/index";
import authRoutes from "./routes/auth";
import sendRoutes from "./routes/send";
import reportRoutes from "./routes/report";
import configRoutes from "./routes/config";
import dashboardRoutes from "./routes/dashboard";

// Load environment variables
config();

const app = new Hono();

// Middleware
app.use("*", cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true
}));
app.use("*", logger());

// Initialize directories
async function initializeDirectories() {
  const dirs = ["./uploads", "./logs"];
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  }
}

// Public routes (no auth required)
app.route("/", indexRoutes);
app.route("/auth", authRoutes);

// Health check
app.get("/health", (c) => {
  return c.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    version: "2.0.0-mongodb",
  });
});

// Swagger UI
app.get("/api-docs", (c) => {
  return c.html(`<!DOCTYPE html>
<html>
<head>
  <title>Bulk Email Sender - Swagger UI</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3/swagger-ui.css">
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; padding: 0; background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@3/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@3/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: "/swagger.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      })
      window.ui = ui
    }
  </script>
</body>
</html>`);
});

// Swagger JSON
app.get("/swagger.json", (c) => {
  return c.json({
    openapi: "3.0.0",
    info: {
      title: "Bulk Email Sender API",
      version: "2.0.0",
      description: "Complete API for bulk email sending with user management"
    },
    servers: [{ url: "http://localhost:3000", description: "Development" }],
    paths: {
      "/auth/register": {
        post: {
          tags: ["Authentication"],
          summary: "Register new user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: { type: "string" },
                    name: { type: "string" },
                    password: { type: "string" }
                  }
                }
              }
            }
          },
          responses: { "200": { description: "User registered" } }
        }
      },
      "/auth/login": {
        post: {
          tags: ["Authentication"],
          summary: "Login user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: { type: "string" },
                    password: { type: "string" }
                  }
                }
              }
            }
          },
          responses: { "200": { description: "Login successful" } }
        }
      },
      "/auth/logout": {
        post: {
          tags: ["Authentication"],
          summary: "Logout user",
          responses: { "200": { description: "Logout successful" } }
        }
      },
      "/auth/me": {
        get: {
          tags: ["Authentication"],
          summary: "Get current user",
          responses: { "200": { description: "User info" } }
        }
      },
      "/config/smtp": {
        get: {
          tags: ["SMTP Configuration"],
          summary: "Get all SMTP configurations",
          responses: { "200": { description: "List of SMTP configs" } }
        },
        post: {
          tags: ["SMTP Configuration"],
          summary: "Create new SMTP configuration",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    host: { type: "string" },
                    port: { type: "number" },
                    secure: { type: "boolean" },
                    user: { type: "string" },
                    pass: { type: "string" },
                    fromEmail: { type: "string" },
                    fromName: { type: "string" }
                  }
                }
              }
            }
          },
          responses: { "200": { description: "Config created" } }
        }
      },
      "/config/smtp/{id}": {
        put: {
          tags: ["SMTP Configuration"],
          summary: "Update SMTP configuration",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Config updated" } }
        },
        delete: {
          tags: ["SMTP Configuration"],
          summary: "Delete SMTP configuration",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Config deleted" } }
        }
      },
      "/config/smtp/{id}/default": {
        post: {
          tags: ["SMTP Configuration"],
          summary: "Set as default configuration",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Default set" } }
        }
      },
      "/send": {
        post: {
          tags: ["Email Sending"],
          summary: "Send bulk emails",
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    subject: { type: "string" },
                    htmlContent: { type: "string" },
                    delay: { type: "number" },
                    excelFile: { type: "string", format: "binary" }
                  }
                }
              }
            }
          },
          responses: { "200": { description: "Emails sent" } }
        }
      },
      "/report": {
        get: {
          tags: ["Reports"],
          summary: "Get email logs and statistics",
          responses: { "200": { description: "Email logs" } }
        }
      },
      "/report/clear": {
        delete: {
          tags: ["Reports"],
          summary: "Clear all email logs",
          responses: { "200": { description: "Logs cleared" } }
        }
      },
      "/dashboard/stats": {
        get: {
          tags: ["Dashboard"],
          summary: "Get dashboard statistics",
          responses: { "200": { description: "Dashboard stats" } }
        }
      }
    }
  });
});

// Protected routes - apply auth middleware
app.use("/send/*", authMiddleware);
app.use("/report/*", authMiddleware);
app.use("/config/*", authMiddleware);
app.use("/dashboard/*", authMiddleware);
app.use("/user/*", authMiddleware);

app.route("/send", sendRoutes);
app.route("/report", reportRoutes);
app.route("/config", configRoutes);
app.route("/dashboard", dashboardRoutes);

// User info endpoint
app.get("/user/info", async (c) => {
  try {
    const token = c.req.cookie("session_token");
    if (!token) {
      return c.json({ success: false, message: "Not authenticated" }, 401);
    }

    const user = await mongoDatabase.getUserBySession(token);
    if (!user) {
      return c.json({ success: false, message: "Session expired" }, 401);
    }

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    return c.json({ success: false, message: "Error fetching user info" }, 500);
  }
});

// 404 handler
app.notFound((c) => {
  console.log("404 - Path not found:", c.req.path);
  return c.json({ message: "Endpoint not found", path: c.req.path }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error("Application error:", err);
  return c.json(
    {
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    },
    500
  );
});

// Initialize and start server
const port = parseInt(process.env.PORT || "3000");

async function startServer() {
  console.log("🚀 Initializing Bulk Email Sender with MongoDB...");
  
  // Connect to MongoDB
  await mongoDatabase.connect();
  
  // Initialize directories
  await initializeDirectories();

  // Display configuration status
  console.log("\n📋 Configuration Status:");
  if (process.env.SMTP_HOST) {
    console.log("✅ Global SMTP configuration found in environment variables");
    console.log(`   Host: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
    console.log(`   User: ${process.env.SMTP_USER}`);
    console.log(`   From: ${process.env.FROM_EMAIL}`);
    console.log("   📝 Note: Users can create their own SMTP configurations");
  } else {
    console.log("⚠️  No global SMTP configuration found in .env file");
    console.log("   📝 Users will need to configure their own SMTP settings");
  }

  console.log("\n🔐 Authentication Features:");
  console.log("✅ User registration and login");
  console.log("✅ Session-based authentication");
  console.log("✅ User-specific SMTP configurations");
  console.log("✅ Secure password hashing with Argon2");
  console.log("✅ MongoDB database");

  console.log(`\n🌐 Server starting on port ${port}`);
  console.log(`   🖥️  Backend API: http://localhost:${port}`);
  console.log(`   🎨 Frontend: http://localhost:5173`);
  console.log(`   📚 Swagger UI: http://localhost:${port}/api-docs`);
  console.log(`   📋 Swagger JSON: http://localhost:${port}/swagger.json`);

  // Clean up expired sessions on startup
  setTimeout(async () => {
    try {
      const count = await mongoDatabase.cleanExpiredSessions();
      console.log(`🧹 Cleaned ${count} expired sessions on startup`);
    } catch (error) {
      console.error("Error cleaning expired sessions:", error);
    }
  }, 1000);

  serve({
    fetch: app.fetch,
    port
  });
}

startServer().catch(console.error);
