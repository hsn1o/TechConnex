import "dotenv/config.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes/index.js";
import { io } from "./index.js"; // Import the io instance

const app = express();

// Security middlewares
app.use(helmet());

// Enable CORS for all routes
app.use(cors());

// Parse incoming JSON
app.use(express.json({ limit: "1mb" }));

// Log HTTP requests in development
app.use(morgan("dev"));

// Register routes
app.use("", routes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ ok: true, message: "API is healthy" });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler (important for catching thrown errors)
app.use((err, req, res, next) => {
  console.error("💥 Global error:", err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
  req.io = io;
  next();
});

export default app;
