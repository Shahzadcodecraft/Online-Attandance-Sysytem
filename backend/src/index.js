import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/db.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin === "*" ? true : env.corsOrigin,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "faceguard-backend" });
});

app.use("/api", attendanceRoutes);

app.use((err, _req, res, _next) => {
  const message = err instanceof Error ? err.message : "Unexpected server error";
  res.status(500).json({ message });
});

connectDatabase()
  .then(() => {
    app.listen(env.port, () => {
      console.log(`FaceGuard backend listening on port ${env.port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect MongoDB:", err);
    process.exit(1);
  });
