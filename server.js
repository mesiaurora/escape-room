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

const DEFAULT_ROOM = "room-1";
const DEFAULT_TIME = 60 * 60;

const rooms = new Map();

const getOrCreateRoom = (roomId) => {
  const normalized = roomId && typeof roomId === "string" ? roomId.trim() : "";
  const id = normalized || DEFAULT_ROOM;

  if (!rooms.has(id)) {
    rooms.set(id, {
      timeLeft: DEFAULT_TIME,
      hint: "",
      isRunning: false,
    });
  }

  return { id, state: rooms.get(id) };
};

const buildSnapshot = () => {
  const snapshot = {};
  rooms.forEach((state, roomId) => {
    snapshot[roomId] = { ...state };
  });
  return snapshot;
};

const emitRoomState = (roomId) => {
  const room = rooms.get(roomId);
  if (!room) return;
  io.to(roomId).emit("updateTime", room.timeLeft);
  io.to(roomId).emit("updateHint", room.hint);
  io.to(roomId).emit("updateRunning", room.isRunning);
  io.emit("roomsSnapshot", buildSnapshot());
};

getOrCreateRoom(DEFAULT_ROOM);

setInterval(() => {
  rooms.forEach((room, roomId) => {
    if (!room.isRunning) return;

    room.timeLeft = Math.max(room.timeLeft - 1, 0);
    io.to(roomId).emit("updateTime", room.timeLeft);

    if (room.timeLeft === 0) {
      room.isRunning = false;
      io.to(roomId).emit("updateRunning", false);
    }
  });

  io.emit("roomsSnapshot", buildSnapshot());
}, 1000);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  io.emit("roomsSnapshot", buildSnapshot());

  socket.on("joinRoom", (roomId) => {
    const { id, state } = getOrCreateRoom(roomId);
    socket.join(id);
    socket.emit("roomState", {
      roomId: id,
      ...state,
    });
    io.emit("roomsSnapshot", buildSnapshot());
  });

  socket.on("startGame", (roomId) => {
    const { id, state } = getOrCreateRoom(roomId);
    state.isRunning = true;
    emitRoomState(id);
  });

  socket.on("pauseGame", (roomId) => {
    const { id, state } = getOrCreateRoom(roomId);
    state.isRunning = false;
    emitRoomState(id);
  });

  socket.on("resetGame", (roomId) => {
    const { id, state } = getOrCreateRoom(roomId);
    state.timeLeft = DEFAULT_TIME;
    state.hint = "";
    state.isRunning = false;
    emitRoomState(id);
  });

  socket.on("updateHint", (payload) => {
    if (!payload || typeof payload !== "object") return;
    const { roomId, hint } = payload;
    const { id, state } = getOrCreateRoom(roomId);
    state.hint = typeof hint === "string" ? hint : "";
    emitRoomState(id);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("WebSocket server running on http://localhost:3001");
});
