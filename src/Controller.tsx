// Controller.tsx
import React, { useState, useEffect } from "react";

export default function Controller() {
  const [timeLeft, setTimeLeft] = useState(60 * 60);
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            setIsRunning(true);
            break;
          case 'p':
            setIsRunning(false);
            break;
          case 'r':
            setIsRunning(false);
            setTimeLeft(60 * 60);
            setDisplayHint("");
            setSelectedHint("");
            break;
          case 'h':
            if (selectedHint) setDisplayHint(selectedHint);
            break;
          case 'c':
            setDisplayHint("");
            break;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedHint]);

  return (
    <div className="min-h-screen bg-gray-800 text-white p-6 font-mono space-y-6">
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
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedHint(e.target.value)}
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
  );
}