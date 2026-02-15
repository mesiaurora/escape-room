import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Controller from "./Controller";

jest.mock("socket.io-client", () => ({
  __mockSocket: {
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  },
  io: jest.fn(() => {
    const mod = jest.requireMock("socket.io-client");
    return mod.__mockSocket;
  }),
}));

const { __mockSocket: mockSocket } = jest.requireMock("socket.io-client") as {
  __mockSocket: {
    emit: ReturnType<typeof jest.fn>;
    on: ReturnType<typeof jest.fn>;
    off: ReturnType<typeof jest.fn>;
  };
};

describe("Controller", () => {
  const renderController = async () => {
    render(<Controller />);
    await screen.findByRole("option", { name: "First hint: Look under the bed" });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue([
        { id: 1, title: "First hint", text: "Look under the bed" },
      ]),
    } as unknown as Response);
  });

  test("loads hints from hints.json and maps title + text", async () => {
    await renderController();
    expect(screen.getByRole("option", { name: "First hint: Look under the bed" })).toBeInTheDocument();

    expect(global.fetch).toHaveBeenCalledWith("/hints.json");
  });

  test("emits updateHint when showing a custom hint", async () => {
    await renderController();

    const textarea = screen.getByPlaceholderText("Write your custom hint here...");
    const showHintButton = screen.getByRole("button", { name: "Show Hint" });

    expect(showHintButton).toBeDisabled();

    fireEvent.change(textarea, { target: { value: "Try the painting" } });
    expect(showHintButton).toBeEnabled();

    fireEvent.click(showHintButton);
    expect(mockSocket.emit).toHaveBeenCalledWith("updateHint", {
      roomId: "room-1",
      hint: "Try the painting",
    });
  });

  test("emits pause and reset events from control buttons", async () => {
    await renderController();

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    expect(mockSocket.emit).toHaveBeenCalledWith("pauseGame", "room-1");
    expect(mockSocket.emit).toHaveBeenCalledWith("resetGame", "room-1");
  });

  test("emits start event for active room", async () => {
    await renderController();

    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    expect(mockSocket.emit).toHaveBeenCalledWith("startGame", "room-1");
  });

  test("adds and switches to a new room", async () => {
    await renderController();

    fireEvent.change(screen.getByPlaceholderText("New room id (example: room-2)"), {
      target: { value: "room-2" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add / Switch" }));

    expect(mockSocket.emit).toHaveBeenCalledWith("joinRoom", "room-2");
    expect(screen.getByText("Active Room: room-2")).toBeInTheDocument();
  });
});
