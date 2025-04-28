const express = require('express');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

let currentTime = 60 * 60;
let currentHint = "";

io.on('connection', (socket) => {
  console.log("🛜 Client connected:", socket.id);

  // Send current state to new player
  socket.emit("updateTime", currentTime);
  socket.emit("updateHint", currentHint);

  socket.on("updateTime", (time) => {
    currentTime = time;
    io.emit("updateTime", time);
  });

  socket.on("updateHint", (hint) => {
    currentHint = hint;
    io.emit("updateHint", hint);
  });

  socket.on("resetGame", () => {
    currentTime = 60 * 60;
    currentHint = "";
    io.emit("updateTime", currentTime);
    io.emit("updateHint", currentHint);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("🚀 WebSocket server running on http://localhost:3001");
});