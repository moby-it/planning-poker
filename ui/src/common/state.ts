import { createSignal, createRoot, createEffect } from "solid-js";

export const BrowserStorageKeys = {
  username: "username",
  isSpectator: "isSpectator",
};

export const [roomId, setRoomId] = createSignal("");
export const [isSpectator, setIsSpectator] = createSignal(
  Boolean(Number(localStorage.getItem(BrowserStorageKeys.isSpectator)))
);
export const [username, setUsername] = createSignal(
  localStorage.getItem(BrowserStorageKeys.username) ?? ""
);

createRoot(() => {
  createEffect(() => {
    localStorage.setItem("username", username());
  });
  createEffect(() => {
    localStorage.setItem("isSpectator", isSpectator() ? "1" : "0");
  });
});
