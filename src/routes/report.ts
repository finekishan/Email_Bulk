import { Hono } from "hono";
import { mongoDatabase } from "../services/mongoDatabase";
import { getUser } from "../middleware/auth";

const app = new Hono();

app.get("/", async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ success: false, message: "Authentication required" }, 401);
  }
  const logs = await mongoDatabase.getEmailLogs(user.id);
  const stats = await mongoDatabase.getEmailStats(user.id);

  return c.json({
    success: true,
    data: { logs, stats },
  });
});

app.delete("/clear", async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ success: false, message: "Authentication required" }, 401);
  }
  await mongoDatabase.clearEmailLogs(user.id);
  return c.json({ success: true, message: "Logs cleared successfully" });
});

export default app;
