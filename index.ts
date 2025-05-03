import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://portfolio-six-alpha-11.vercel.app", // Replace with your frontend domain
    methods: ["GET", "POST"],
  },
});

let activeUsers = 0;

io.on("connection", (socket) => {
  activeUsers++;
  console.log("User connected. Active users:", activeUsers);
  io.emit("activeUsers", activeUsers);

  socket.on("disconnect", () => {
    activeUsers--;
    console.log("User disconnected. Active users:", activeUsers);
    io.emit("activeUsers", activeUsers);
  });
});

server.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
