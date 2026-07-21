import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";

import { env } from "@config/env";
import { connectDB } from "@config/db";
import routes from "@routes/index";
import { errorHandler, notFoundHandler } from "@middlewares/errorHandler";
import { registerSocketHandlers } from "@sockets/index";
import path from "path";

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: env.clientUrl, credentials: true },
});

// --- Global middlewares ---
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// --- Static files ---
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

// --- Health check ---
app.get("/health", (_req, res) => {
  res.json({ success: true, message: "TalentHire API is running" });
});

// --- API routes ---
app.use("/api/v1", routes);

// --- 404 + error handling ---
app.use(notFoundHandler);
app.use(errorHandler);

// --- Socket.io ---
registerSocketHandlers(io);

const start = async () => {
  await connectDB();
  httpServer.listen(env.port, () => {
    console.log(`🚀 TalentHire API listening on port ${env.port}`);
  });
};

start();
