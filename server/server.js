import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { initSocket } from "./socket.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Simple health check — confirms the API and DB connection are alive.
// Useful for the frontend and for Postman testing during development.
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "RecordMate API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);

// Remaining feature routes are mounted here in later phases, e.g.:
// app.use("/api/conversations", conversationRoutes);
// app.use("/api/messages", messageRoutes);
// app.use("/api/ratings", ratingRoutes);
// app.use("/api/reports", reportRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// http.createServer(app) is exactly what app.listen() did under the hood —
// this just makes the server explicit so Socket.IO can attach to the same
// underlying HTTP server instead of opening a second port.
const httpServer = http.createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
