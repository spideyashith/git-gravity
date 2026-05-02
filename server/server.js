// server/server.js
// Express entry point — mounts auth + API routes, CORS, error handling.

import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import apiRoutes from "./routes/apiRoutes.js";

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ─────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// Simple cookie parser (no external dep needed)
app.use((req, _res, next) => {
  req.cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(";").forEach((c) => {
      const [key, ...rest] = c.trim().split("=");
      req.cookies[key] = rest.join("=");
    });
  }
  next();
});

// ── Routes ────────────────────────────────────────────────────
app.use("/auth", authRoutes);
app.use("/api", apiRoutes);

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ── Error handler ─────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[Server Error]", err.message);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Git Gravity API server running on http://localhost:${PORT}`);
});
