import React, { useCallback, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import "./Controller.css";

const socket = io("http://localhost:3001");
const DEFAULT_ROOM = "room-1";

type RoomState = {
  timeLeft: number;
  hint: string;
  isRunning: boolean;
};

type RoomsSnapshot = Record<string, RoomState>;

export default function Controller() {
  const [rooms, setRooms] = useState<RoomsSnapshot>({});
  const [activeRoomId, setActiveRoomId] = useState(DEFAULT_ROOM);
  const [newRoomId, setNewRoomId] = useState("");
  const [hints, setHints] = useState<string[]>([]);
  const [selectedHint, setSelectedHint] = useState<string>("");

  const activeRoom = rooms[activeRoomId] || { timeLeft: 60 * 60, hint: "", isRunning: false };

  const startGame = useCallback(() => {
    socket.emit("startGame", activeRoomId);
  }, [activeRoomId]);

  const pauseGame = useCallback(() => {
    socket.emit("pauseGame", activeRoomId);
  }, [activeRoomId]);

  const resetGame = useCallback(() => {
    setSelectedHint("");
    socket.emit("resetGame", activeRoomId);
  }, [activeRoomId]);

  const showHint = useCallback(() => {
    socket.emit("updateHint", { roomId: activeRoomId, hint: selectedHint });
  }, [activeRoomId, selectedHint]);

  const clearHint = useCallback(() => {
    setSelectedHint("");
    socket.emit("updateHint", { roomId: activeRoomId, hint: "" });
  }, [activeRoomId]);

  useEffect(() => {
    fetch("/hints.json")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const mappedHints = data.map(
            (hint: { id: number; title: string; text: string }) => `${hint.title}: ${hint.text}`
          );
          setHints(mappedHints);
        }
      })
      .catch((err) => console.error("Failed to load hints:", err));
  }, []);

  useEffect(() => {
    socket.emit("joinRoom", activeRoomId);
  }, [activeRoomId]);

  useEffect(() => {
    const handleSnapshot = (snapshot: RoomsSnapshot) => {
      setRooms(snapshot || {});
    };

    const handleRoomState = (roomState: { roomId: string } & RoomState) => {
      setRooms((prev) => ({
        ...prev,
        [roomState.roomId]: {
          timeLeft: roomState.timeLeft,
          hint: roomState.hint,
          isRunning: roomState.isRunning,
        },
      }));
    };

    socket.on("roomsSnapshot", handleSnapshot);
    socket.on("roomState", handleRoomState);

    return () => {
      socket.off("roomsSnapshot", handleSnapshot);
      socket.off("roomState", handleRoomState);
    };
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
  }, [clearHint, pauseGame, resetGame, selectedHint, showHint, startGame]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const roomIds = useMemo(() => {
    const keys = Object.keys(rooms);
    return keys.length ? keys.sort() : [DEFAULT_ROOM];
  }, [rooms]);

  const addOrSwitchRoom = () => {
    const normalized = newRoomId.trim();
    if (!normalized) return;
    setActiveRoomId(normalized);
    setNewRoomId("");
  };

  return (
    <main className="controller-page">
      <section className="controller-shell">
        <header className="controller-header">
          <h1>Game Controller</h1>
          <p>Manage multiple rooms from one dashboard.</p>
        </header>

        <section className="controller-room-manager">
          <p className="controller-label">Room Manager</p>
          <div className="controller-room-form">
            <input
              className="controller-input"
              placeholder="New room id (example: room-2)"
              value={newRoomId}
              onChange={(e) => setNewRoomId(e.target.value)}
            />
            <button className="controller-button show" onClick={addOrSwitchRoom}>
              Add / Switch
            </button>
          </div>
          <div className="controller-room-list">
            {roomIds.map((roomId) => (
              <button
                key={roomId}
                className={`controller-room-chip ${roomId === activeRoomId ? "active" : ""}`}
                onClick={() => setActiveRoomId(roomId)}
              >
                {roomId}
              </button>
            ))}
          </div>
        </section>

        <section className="controller-time-card">
          <p className="controller-label">Active Room: {activeRoomId}</p>
          <p className="controller-time">{formatTime(activeRoom.timeLeft)}</p>
          <p className={`controller-status ${activeRoom.isRunning ? "running" : "paused"}`}>
            {activeRoom.isRunning ? "Running" : "Paused"}
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
            <button className="controller-button show" onClick={showHint} disabled={!selectedHint}>
              Show Hint
            </button>
            <button className="controller-button clear" onClick={clearHint}>
              Clear Hint
            </button>
          </div>
        </section>

        <section className="controller-preview">
          <p className="controller-label">Current Hint Preview</p>
          <div className="controller-preview-box">{activeRoom.hint || "No hint visible."}</div>
        </section>
      </section>
    </main>
  );
}
