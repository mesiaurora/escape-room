// App.tsx
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Controller from "./Controller";
import PlayerView from "./PlayerView";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/controller" element={<Controller />} />
        <Route path="/player" element={<PlayerView />} />
      </Routes>
    </Router>
  );
}