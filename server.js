require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./prepai/backend/config/db");
const logger = require("./prepai/backend/utils/logger");
const cacheService = require("./prepai/backend/services/cacheService");
const globalErrorHandler = require("./prepai/backend/middleware/errorMiddleware");

// Connect DB (handles offline/in-memory mode gracefully)
connectDB();

const app = express();

// Global Request Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// HTTP Request Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// API Routes
app.use("/api/auth", require("./prepai/backend/routes/authRoutes"));
app.use("/api/questions", require("./prepai/backend/routes/questionRoutes"));
app.use("/api", require("./prepai/backend/routes/progressRoutes"));

// Health check & Observability routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "PrepAI API running on Service-Oriented Architecture with RAG & Redis Caching",
  });
});

app.get("/api/cache/stats", (req, res) => {
  res.json({
    status: "success",
    stats: cacheService.getStats(),
  });
});

// Serve frontend: Vite middleware in dev mode, static files in prod mode
async function setupFrontend() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: path.join(__dirname, "prepai/frontend"),
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "prepai/frontend/dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global Error Handler Middleware (MUST be registered after routes & frontend)
  app.use(globalErrorHandler);
}

setupFrontend().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`PrepAI Server running on http://0.0.0.0:${PORT}`);
  });
});
