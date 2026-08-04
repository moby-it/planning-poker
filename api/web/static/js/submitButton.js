/**
 * The one button that drives a round forward. What it offers depends on where
 * the round is; spectators never get one.
 */

const BUTTONS = {
  Revealable: { testId: "reveal-round", label: "Reveal Cards", color: "primary", action: "roundToReveal" },
  Revealing: { testId: "cancel-reveal", label: "Cancel Reveal", color: "default", action: "cancelReveal" },
  Revealed: { testId: "start-new-round", label: "Start New Round", color: "primary", action: "roundToStart" },
};

const ID = "submit-btn";

/**
 * @param {string} status
 * @param {{spectator: boolean, onAction: (action: string) => void}} options
 */
export function render(status, { spectator, onAction }) {
  document.getElementById(ID)?.remove();

  const spec = BUTTONS[status];
  if (!spec || spectator) return;

  const board = document.querySelector(".board");
  if (!board) return;

  const button = document.createElement("button");
  button.id = ID;
  button.type = "button";
  button.className = `btn ${spec.color}`;
  button.dataset.testid = spec.testId;
  button.addEventListener("click", () => onAction(spec.action));

  const label = document.createElement("span");
  label.textContent = spec.label;
  button.appendChild(label);

  // Sits between the board and the hand, where the SolidJS version had it.
  board.parentNode.insertBefore(button, board.nextSibling);
}

export function remove() {
  document.getElementById(ID)?.remove();
}
