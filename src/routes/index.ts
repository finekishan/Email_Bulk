import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.json({ message: "Bulk Email Sender API", version: "2.0.0" });
});

export default app;
