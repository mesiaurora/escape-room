import React, { useState, useEffect } from "react";

export default function EscapeRoomController() {
  const [timeLeft, setTimeLeft] = useState(60 * 60); // default 60 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [hints, setHints] = useState<string[]>([]);
  const [selectedHint, setSelectedHint] = useState<string>("");
  const [displayHint, setDisplayHint] = useState<string>("");

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft]);

  useEffect(() => {
    // Load hints from a file (JSON assumed)
    fetch("/hints.json")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setHints(data);
        } else {
          console.error("Invalid hint format");
        }
      })
      .catch((err) => console.error("Failed to load hints:", err));
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
      {/* Player View */}
      <div className="bg-gray-900 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
        <div>
          <h1 className="text-3xl mb-4">⏳ Time Remaining</h1>
          <div className="text-6xl font-bold text-green-400">{formatTime(timeLeft)}</div>
        </div>
        <div className="mt-10">
          <h2 className="text-xl mb-2">👻 Hint</h2>
          <div className="text-lg bg-gray-800 p-4 rounded-xl min-h-[4rem]">
            {displayHint || <span className="text-gray-500">No hint yet...</span>}
          </div>
        </div>
      </div>

      {/* Controller View */}
      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg space-y-4">
        <h1 className="text-2xl">🎛️ Game Controller</h1>
        <div className="flex gap-2">
          <button onClick={() => setIsRunning(true)}>Start</button>
          <button onClick={() => setIsRunning(false)}>Pause</button>
          <button
            onClick={() => {
              setIsRunning(false);
              setTimeLeft(60 * 60);
              setDisplayHint("");
              setSelectedHint("");
            }}
          >
            Reset
          </button>
        </div>

        <div>
          <label className="block mb-1 mt-4">Select Hint</label>
          <select
            className="w-full bg-gray-700 text-white p-2 rounded-md"
            value={selectedHint}
            onChange={(e) => setSelectedHint(e.target.value)}
          >
            <option value="">-- Choose a hint --</option>
            {hints.map((hint, idx) => (
              <option key={idx} value={hint}>{hint}</option>
            ))}
          </select>
          <div className="flex gap-2 mt-2">
            <button onClick={() => setDisplayHint(selectedHint)} disabled={!selectedHint}>
              Show Hint
            </button>
            <button onClick={() => setDisplayHint("")}>Clear Hint</button>
          </div>
        </div>
      </div>
    </div>
  );
}
