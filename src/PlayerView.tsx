// PlayerView.tsx
import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./PlayerView.css";
const socket = io("http://localhost:3001");

export default function PlayerView() {
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [displayHint, setDisplayHint] = useState<string>("");

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  useEffect(() => {
    socket.on("updateTime", (newTime: number) => {
      setTimeLeft(newTime);
    });
  
    socket.on("updateHint", (newHint: string) => {
      setDisplayHint(newHint);
    });
  
    return () => {
      socket.off("updateTime");
      socket.off("updateHint");
    };
  }, []);

  return (
    <div className="playerview">
      <center>
        <h1 className="time-title"> Time Remaining / Aikaa Jäljellä </h1>
        <h1 className="time-display">{formatTime(timeLeft)}</h1>
        <div className="hint-title">Hint / Vihje </div>
        <div className="hint-box">
          {displayHint || <span className="hint">No hint yet...</span>}
        </div>
      </center>
    </div>
  );
}
