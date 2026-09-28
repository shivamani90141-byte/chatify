import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
});

io.use(socketAuthMiddleware);

// Stores multiple socket connections for each user
// { userId: Set(socketId1, socketId2, ...) }
const userSocketMap = {};

// Get socket IDs of a user
export function getReceiverSocketId(userId) {
  return userSocketMap[userId]
    ? [...userSocketMap[userId]]
    : [];
}

io.on("connection", (socket) => {
  console.log(
    "A user connected:",
    socket.user.fullName,
    `(${socket.id})`
  );

  const userId = socket.userId;

  // Create a Set for this user if it doesn't exist
  if (!userSocketMap[userId]) {
    userSocketMap[userId] = new Set();
  }

  // Add this socket
  userSocketMap[userId].add(socket.id);

  // Send currently online users to everyone
  io.emit(
    "getOnlineUsers",
    Object.keys(userSocketMap)
  );

  socket.on("disconnect", () => {
    console.log(
      "A user disconnected:",
      socket.user.fullName,
      `(${socket.id})`
    );

    // Remove this socket
    userSocketMap[userId]?.delete(socket.id);

    // If the user has no remaining connections,
    // remove the user completely
    if (
      userSocketMap[userId] &&
      userSocketMap[userId].size === 0
    ) {
      delete userSocketMap[userId];
    }

    // Update everyone
    io.emit(
      "getOnlineUsers",
      Object.keys(userSocketMap)
    );
  });
});

export { io, app, server };