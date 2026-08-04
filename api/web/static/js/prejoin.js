import { navigate } from "./router.js";
import {
  MAX_USERNAME_LENGTH,
  getUsername,
  isSpectator,
  setSpectator,
  setUsername,
} from "./state.js";

/**
 * The form a visitor fills in before entering a room — either creating one, or
 * naming themselves on the way into an existing one.
 */
export function initPrejoin() {
  const form = document.querySelector(".prejoin-form");
  if (!form) return;

  const roomId = form.dataset.roomId;
  const creating = !roomId;
  const input = form.querySelector('[data-testid="username-input"]');
  const submit = form.querySelector('[data-testid="create-room"]');
  const scaleSelect = form.querySelector('[data-testid="scale-select"]');
  const spectatorToggle = form.querySelector('input[name="isSpectator"]');

  input.value = getUsername();
  spectatorToggle.checked = isSpectator();

  spectatorToggle.addEventListener("change", (event) => {
    setSpectator(event.target.checked);
  });

  input.addEventListener("keyup", (event) => {
    const username = event.target.value;
    if (username.length > MAX_USERNAME_LENGTH) {
      showError(`Username must be less than ${MAX_USERNAME_LENGTH} characters`);
      return;
    }
    clearError();
    setUsername(username);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = input.value;
    if (!username) {
      showError("Please add a username");
      return;
    }
    setUsername(username);

    if (!creating) {
      navigate(`/room/${roomId}`, { replace: true });
      return;
    }

    // Creating: the server hands back the id of the room it just made.
    submit.disabled = true;
    try {
      const created = await createRoom(scaleSelect ? scaleSelect.value : "");
      navigate(`/room/${created}`, { replace: true });
    } catch (e) {
      console.error(e);
      submit.disabled = false;
      showError("Could not create the room. Please try again.");
    }
  });

  function showError(message) {
    clearError();
    const error = document.createElement("span");
    error.className = "error";
    error.textContent = message;
    input.parentNode.appendChild(error);
    submit.disabled = true;
  }

  function clearError() {
    form.querySelector(".error")?.remove();
    submit.disabled = false;
  }
}

async function createRoom(scale) {
  const url = `/v1/createRoom?scale=${encodeURIComponent(scale)}`;
  const response = await fetch(url, { method: "POST" });
  if (!response.ok) throw new Error(`createRoom responded ${response.status}`);
  return response.text();
}
