import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./PlayerView.css";

const socket = io("http://localhost:3001");

export default function PlayerView() {
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [displayHint, setDisplayHint] = useState<string>("");

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
        <h2 className="time-display">{formatTime(timeLeft)}</h2>
        <p className="hint-title">Hint / Vihje</p>
        <div className="hint-box" aria-live="polite">
          {displayHint || <span className="hint-empty">No hint yet...</span>}
        </div>
      </section>
    </main>
  );
}
