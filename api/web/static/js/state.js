/**
 * Who the visitor is, remembered between visits.
 *
 * The server never learns any of this: a username is only ever sent when
 * opening a room's websocket.
 */

const KEYS = {
  username: "username",
  isSpectator: "isSpectator",
};

export const MAX_USERNAME_LENGTH = 12;

// A username saved before the limit existed would be rejected by the room, so
// drop it rather than letting the visitor fail at the door.
const stored = localStorage.getItem(KEYS.username);
if (typeof stored === "string" && stored.length > MAX_USERNAME_LENGTH) {
  localStorage.removeItem(KEYS.username);
}

export function getUsername() {
  return localStorage.getItem(KEYS.username) ?? "";
}

export function setUsername(username) {
  localStorage.setItem(KEYS.username, username);
}

export function clearUsername() {
  localStorage.removeItem(KEYS.username);
}

export function isSpectator() {
  return localStorage.getItem(KEYS.isSpectator) === "1";
}

export function setSpectator(spectator) {
  localStorage.setItem(KEYS.isSpectator, spectator ? "1" : "0");
}

export function role() {
  return isSpectator() ? "spectator" : "voter";
}
