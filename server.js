const express = require("express");
const { Server } = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let currentTime = 60 * 60;
let currentHint = "";
let isRunning = false;

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.emit("updateTime", currentTime);
  socket.emit("updateHint", currentHint);
  socket.emit("updateRunning", isRunning);

  socket.on("startGame", () => {
    isRunning = true;
    io.emit("updateRunning", isRunning);
  });

  socket.on("pauseGame", () => {
    isRunning = false;
    io.emit("updateRunning", isRunning);
    io.emit("updateTime", currentTime);
  });

  socket.on("updateTime", (time) => {
    currentTime = time;
    io.emit("updateTime", currentTime);
  });

  socket.on("updateHint", (hint) => {
    currentHint = hint;
    io.emit("updateHint", currentHint);
  });

  socket.on("resetGame", () => {
    currentTime = 60 * 60;
    currentHint = "";
    isRunning = false;
    io.emit("updateTime", currentTime);
    io.emit("updateHint", currentHint);
    io.emit("updateRunning", isRunning);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("WebSocket server running on http://localhost:3001");
});
