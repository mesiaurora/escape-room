// PlayerView.tsx
import React, { useState, useEffect } from "react";

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

  return (
    <div className="min-h-screen bg-black text-white p-6 font-mono flex flex-col items-center justify-center space-y-6">
      <h1 className="text-3xl">⏳ Time Remaining</h1>
      <div className="text-6xl font-bold text-green-400">{formatTime(timeLeft)}</div>
      <div className="text-xl mt-10">👻 Hint</div>
      <div className="text-lg bg-gray-800 p-4 rounded-xl min-h-[4rem] w-full max-w-md text-center">
        {displayHint || <span className="text-gray-500">No hint yet...</span>}
      </div>
    </div>
  );
}
