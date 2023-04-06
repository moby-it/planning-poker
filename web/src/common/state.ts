import { createSignal, createRoot, createEffect } from "solid-js";

export const BrowserStorageKeys = {
  username: "username",
  isSpectator: "isSpectator",
};
const storageUsername = localStorage.getItem(BrowserStorageKeys.username);
if (typeof storageUsername === 'string' && storageUsername.length > 12) localStorage.removeItem(BrowserStorageKeys.username);

export const [roomId, setRoomId] = createSignal("");
export const [isSpectator, setIsSpectator] = createSignal(
  Boolean(Number(localStorage.getItem(BrowserStorageKeys.isSpectator)))
);
export const role = () => (isSpectator() ? "spectator" : "voter");
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
