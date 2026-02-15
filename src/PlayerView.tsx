import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./PlayerView.css";

const socket = io("http://localhost:3001");
const DEFAULT_ROOM = "room-1";

export default function PlayerView() {
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [displayHint, setDisplayHint] = useState<string>("");
  const [roomId, setRoomId] = useState(DEFAULT_ROOM);

  useEffect(() => {
    const fromQuery = new URLSearchParams(window.location.search).get("room");
    setRoomId((fromQuery || DEFAULT_ROOM).trim() || DEFAULT_ROOM);
  }, []);

  useEffect(() => {
    socket.emit("joinRoom", roomId);

    const handleRoomState = (roomState: {
      roomId: string;
      timeLeft: number;
      hint: string;
      isRunning: boolean;
    }) => {
      if (roomState.roomId !== roomId) return;
      setTimeLeft(roomState.timeLeft);
      setDisplayHint(roomState.hint);
    };

    const handleUpdateTime = (newTime: number) => {
      setTimeLeft(newTime);
    };

    const handleUpdateHint = (newHint: string) => {
      setDisplayHint(newHint);
    };

    socket.on("roomState", handleRoomState);
    socket.on("updateTime", handleUpdateTime);
    socket.on("updateHint", handleUpdateHint);

    return () => {
      socket.off("roomState", handleRoomState);
      socket.off("updateTime", handleUpdateTime);
      socket.off("updateHint", handleUpdateHint);
    };
  }, [roomId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <main className="playerview">
      <section className="playerview-panel">
        <h1 className="time-title">Time Remaining / Aikaa Jaljella</h1>
        <p className="hint-title">Room: {roomId}</p>
        <h2 className="time-display">{formatTime(timeLeft)}</h2>
        <p className="hint-title">Hint / Vihje</p>
        <div className="hint-box" aria-live="polite">
          {displayHint || <span className="hint-empty">No hint yet...</span>}
        </div>
      </section>
    </main>
  );
}
