// import { Router } from "@solidjs/router";
// import {
//   render,
//   screen,
//   fireEvent,
//   waitForElementToBeRemoved,
// } from "@solidjs/testing-library";
// import { describe, expect, it, vi } from "vitest";
// import { App } from "../app";
// describe("<App />", () => {
//   beforeEach(() => {
//     // @ts-ignore
//     window.scrollTo = vi.fn();
//     render(() => (
//       <Router>
//         <App />
//       </Router>
//     ));
//   });
//   it("should render home component", () => {
//     const input = screen.getByTestId("username-input");
//     expect(input).toBeInTheDocument();
//   });
//   it("should update username when typing on input", async () => {
//     const input = screen.getByTestId("username-input");
//     const name = "fasolakis";
//     const createRoomBtn = screen.getByTestId("createRoomBtn");
//     expect(createRoomBtn).toBeInTheDocument();
//     fireEvent.keyUp(input, { target: { value: name } });
//     fireEvent.click(createRoomBtn);
//     await waitForElementToBeRemoved(createRoomBtn);
//     const loading = screen.getByTestId("loading");
//     expect(loading).toBeInTheDocument();
//     await waitForElementToBeRemoved(loading);
//     const room = screen.getByTestId("room");
//     expect(room).toBeInTheDocument();
//   });
// });
