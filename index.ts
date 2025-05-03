import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(
  cors({
    origin: "https://portfolio-six-alpha-11.vercel.app",
    credentials: true,
  })
);
app.set("trust proxy", true); // needed to get correct IPs behind proxies

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://portfolio-six-alpha-11.vercel.app", // Replace with your frontend domain
    methods: ["GET", "POST"],
  },
});

const ipToSockets = new Map<string, Set<string>>(); // IP → socket IDs
const socketToIP = new Map<string, string>(); // socket ID → IP

const getClientIP = (socket: any): string => {
  const forwarded = socket.handshake.headers["x-forwarded-for"];
  return (
    (forwarded ? forwarded.split(",")[0] : socket.handshake.address) ||
    "unknown"
  );
};

io.on("connection", (socket) => {
  const ip = getClientIP(socket);
  const socketId = socket.id;

  socketToIP.set(socketId, ip);

  if (!ipToSockets.has(ip)) ipToSockets.set(ip, new Set());
  ipToSockets.get(ip)?.add(socketId);

  io.emit("activeUsers", ipToSockets.size);

  socket.on("disconnect", () => {
    const ip = socketToIP.get(socketId);
    socketToIP.delete(socketId);
    const socketSet = ipToSockets.get(ip!);
    if (socketSet) {
      socketSet.delete(socketId);
      if (socketSet.size === 0) ipToSockets.delete(ip!);
    }

    io.emit("activeUsers", ipToSockets.size);
  });
});

server.listen(4000, () => {
  console.log("Server running on");
});
