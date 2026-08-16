import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./models/User.js";

let io = null;

// Initializes Socket.IO on top of the existing HTTP server. Called once
// from server.js, right alongside where the Express app already listens.
//
// Every connection must present the same JWT issued by /api/auth/login or
// /api/auth/register — sent as `{ auth: { token } }` when the client calls
// io(url, { auth: { token } }). No user id is ever trusted from the client;
// it's derived purely from verifying the token, exactly like the existing
// REST `protect` middleware.
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
    },
  });

  // Runs once per incoming connection, before "connection" fires. Rejecting
  // here (calling next with an Error) refuses the handshake entirely — the
  // client's connection fails closed, it never gets a live socket.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Not authenticated"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("_id");
      if (!user) {
        return next(new Error("Not authenticated"));
      }

      socket.userId = user._id.toString();
      next();
    } catch (err) {
      next(new Error("Not authenticated"));
    }
  });

  io.on("connection", (socket) => {
    // Every tab/device this user has open joins the same named room, so a
    // single emitToUser() call reaches all of them without the rest of the
    // app needing to track individual socket ids.
    socket.join(`user:${socket.userId}`);

    // No server-side state to clean up on disconnect — Socket.IO already
    // removes the socket from its rooms automatically.
    socket.on("disconnect", () => {});
  });

  return io;
};

// Emits an event to every connected socket belonging to one specific
// authenticated user (all their open tabs/devices). Safe to call even if
// Socket.IO never initialized or the user has no live connection right
// now — it silently does nothing in that case, since real-time delivery is
// a convenience layer on top of the REST API, never a requirement for
// correctness.
export const emitToUser = (userId, event, payload) => {
  if (!io || !userId) return;
  io.to(`user:${userId.toString()}`).emit(event, payload);
};

// Emits an event to every currently-connected, authenticated socket. Used
// only for the "a new nearby request may exist" nudge, whose payload is
// already stripped of anything sensitive — real eligibility (radius,
// college, OPEN status) is still decided exclusively by the existing
// /api/requests/nearby and /api/requests/:id REST endpoints when the
// client reacts to this by refetching.
export const emitToAll = (event, payload) => {
  if (!io) return;
  io.emit(event, payload);
};
