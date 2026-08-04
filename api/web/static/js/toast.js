/** Transient notifications, stacked in the top right corner. */

const VISIBLE_MS = 2500;
const FADE_MS = 200;

function show(message, kind) {
  const container = document.getElementById("toaster");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${kind}`;
  toast.setAttribute("role", kind === "error" ? "alert" : "status");
  toast.textContent = message;
  container.appendChild(toast);

  // Let the element land in its start state before transitioning out of it.
  requestAnimationFrame(() => toast.classList.add("shown"));

  setTimeout(() => {
    toast.classList.remove("shown");
    setTimeout(() => toast.remove(), FADE_MS);
  }, VISIBLE_MS);
}

export function success(message) {
  show(message, "success");
}

export function error(message) {
  show(message, "error");
}
