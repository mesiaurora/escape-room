import React from "react";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import PlayerView from "./PlayerView";

const listeners: Record<string, (payload: unknown) => void> = {};
jest.mock("socket.io-client", () => ({
  __mockSocket: {
    emit: jest.fn(),
    on: jest.fn((event: string, cb: (payload: unknown) => void) => {
      listeners[event] = cb;
    }),
    off: jest.fn(),
  },
  io: jest.fn(() => {
    const mod = jest.requireMock("socket.io-client");
    return mod.__mockSocket;
  }),
}));

const { __mockSocket: mockSocket } = jest.requireMock("socket.io-client") as {
  __mockSocket: {
    emit: jest.Mock;
    on: jest.Mock;
    off: jest.Mock;
  };
};

describe("PlayerView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(listeners).forEach((key) => delete listeners[key]);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("shows initial time and decrements locally each second", () => {
    render(<PlayerView />);
    expect(screen.getByText("60:00")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText("59:59")).toBeInTheDocument();
  });

  test("updates displayed time and hint from socket events", () => {
    render(<PlayerView />);
    const updateTimeHandler = mockSocket.on.mock.calls.find(
      (args: unknown[]) => args[0] === "updateTime"
    )?.[1] as (value: number) => void;
    const updateHintHandler = mockSocket.on.mock.calls.find(
      (args: unknown[]) => args[0] === "updateHint"
    )?.[1] as (value: string) => void;

    act(() => {
      updateTimeHandler(125);
      updateHintHandler("Try shining the flashlight at the painting");
    });

    expect(screen.getByText("02:05")).toBeInTheDocument();
    expect(screen.getByText("Try shining the flashlight at the painting")).toBeInTheDocument();
  });

  test("unsubscribes socket listeners on unmount", () => {
    const { unmount } = render(<PlayerView />);
    unmount();

    expect(mockSocket.off).toHaveBeenCalledWith("updateTime");
    expect(mockSocket.off).toHaveBeenCalledWith("updateHint");
  });
});
