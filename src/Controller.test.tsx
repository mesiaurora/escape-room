import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
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
    expect(mockSocket.emit).toHaveBeenCalledWith("updateHint", "Try the painting");
  });

  test("emits pause and reset events from control buttons", async () => {
    await renderController();

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    expect(mockSocket.emit).toHaveBeenCalledWith("pauseGame");
    expect(mockSocket.emit).toHaveBeenCalledWith("resetGame");
  });

  test("emits updateTime every second while running", async () => {
    jest.useFakeTimers();
    await renderController();

    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockSocket.emit).toHaveBeenCalledWith("updateTime", 3599);
  });
});
