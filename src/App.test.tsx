import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock(
  "react-router-dom",
  () => ({
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Routes: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Route: ({ path, Component }: { path: string; Component: React.ComponentType }) =>
      globalThis.location.pathname === path ? <Component /> : null,
  }),
  { virtual: true }
);

jest.mock("./Controller", () => function MockController() {
  return <div>Mock Controller</div>;
});

jest.mock("./PlayerView", () => function MockPlayerView() {
  return <div>Mock Player View</div>;
});

afterEach(() => {
  cleanup();
  window.history.pushState({}, "", "/");
});

test("renders controller route at /controller", async () => {
  window.history.pushState({}, "", "/controller");
  const App = (await import("./App")).default;
  render(<App />);
  expect(screen.getByText("Mock Controller")).toBeInTheDocument();
});

test("renders player route at /player", async () => {
  window.history.pushState({}, "", "/player");
  const App = (await import("./App")).default;
  render(<App />);
  expect(screen.getByText("Mock Player View")).toBeInTheDocument();
});
