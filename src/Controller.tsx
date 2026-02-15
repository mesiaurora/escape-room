import React, { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./Controller.css";

const socket = io("http://localhost:3001");

export default function Controller() {
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [hints, setHints] = useState<string[]>([]);
  const [selectedHint, setSelectedHint] = useState<string>("");
  const [displayHint, setDisplayHint] = useState<string>("");

  const startGame = useCallback(() => {
    setIsRunning(true);
    socket.emit("startGame");
  }, []);

  const pauseGame = useCallback(() => {
    setIsRunning(false);
    socket.emit("pauseGame");
  }, []);

  const resetGame = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(60 * 60);
    setDisplayHint("");
    setSelectedHint("");
    socket.emit("resetGame");
  }, []);

  const showHint = useCallback(() => {
    setDisplayHint(selectedHint);
    socket.emit("updateHint", selectedHint);
  }, [selectedHint]);

  const clearHint = useCallback(() => {
    setDisplayHint("");
    socket.emit("updateHint", "");
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((t) => {
          const newTime = t - 1;
          socket.emit("updateTime", newTime);
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft]);

  useEffect(() => {
    fetch("/hints.json")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const mappedHints = data.map(
            (hint: { id: number; title: string; text: string }) => `${hint.title}: ${hint.text}`
          );
          setHints(mappedHints);
        } else {
          console.error("Invalid hint format");
        }
      })
      .catch((err) => console.error("Failed to load hints:", err));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case "s":
            startGame();
            break;
          case "p":
            pauseGame();
            break;
          case "r":
            resetGame();
            break;
          case "h":
            if (selectedHint) showHint();
            break;
          case "c":
            clearHint();
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedHint, clearHint, pauseGame, resetGame, showHint, startGame]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <main className="controller-page">
      <section className="controller-shell">
        <header className="controller-header">
          <h1>Game Controller</h1>
          <p>Manage the game timer and send hints to player screens.</p>
        </header>

        <section className="controller-time-card">
          <p className="controller-label">Time Remaining</p>
          <p className="controller-time">{formatTime(timeLeft)}</p>
          <p className={`controller-status ${isRunning ? "running" : "paused"}`}>
            {isRunning ? "Running" : "Paused"}
          </p>
        </section>

        <section className="controller-actions">
          <button className="controller-button start" onClick={startGame}>
            Start
          </button>
          <button className="controller-button pause" onClick={pauseGame}>
            Pause
          </button>
          <button className="controller-button reset" onClick={resetGame}>
            Reset
          </button>
        </section>

        <section className="controller-hints">
          <label htmlFor="hint-select" className="controller-label">
            Select Hint
          </label>
          <select
            id="hint-select"
            className="controller-select"
            value={selectedHint}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedHint(e.target.value)}
          >
            <option value="">-- Choose a hint --</option>
            {hints.map((hint, idx) => (
              <option key={idx} value={hint}>
                {hint}
              </option>
            ))}
          </select>

          <label htmlFor="hint-custom" className="controller-label">
            Custom Hint
          </label>
          <textarea
            id="hint-custom"
            className="controller-textarea"
            placeholder="Write your custom hint here..."
            value={selectedHint}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSelectedHint(e.target.value)}
          />

          <div className="controller-actions">
            <button
              className="controller-button show"
              onClick={showHint}
              disabled={!selectedHint}
            >
              Show Hint
            </button>
            <button className="controller-button clear" onClick={clearHint}>
              Clear Hint
            </button>
          </div>
        </section>

        <section className="controller-preview">
          <p className="controller-label">Current Hint Preview</p>
          <div className="controller-preview-box">{displayHint || "No hint visible."}</div>
        </section>
      </section>
    </main>
  );
}
