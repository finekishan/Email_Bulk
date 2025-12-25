// src/routes/dashboard.ts
import { Hono } from "hono";
import { mongoDatabase } from "../services/mongoDatabase";
import { getUser } from "../middleware/auth";

const app = new Hono();

app.get("/poll-status", (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ success: false, message: "Authentication required" }, 401);
  }
  return c.json({
    success: true,
    data: {
      pollNeeded: false,
      pollInterval: 30000,
      hasActiveBatch: false,
      hasScheduledJobs: false,
    },
  });
});

app.get("/stats", async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ success: false, message: "Authentication required" }, 401);
  }
  
  try {
    const stats = await mongoDatabase.getEmailStats(user.id);
    return c.json({
      success: true,
      data: {
        totalSent: stats.total,
        successRate: parseFloat(stats.successRate),
        failed: stats.failed,
        scheduled: 0,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return c.json({
      success: true,
      data: {
        totalSent: 0,
        successRate: 0,
        failed: 0,
        scheduled: 0,
      },
    });
  }
});

export default app;
