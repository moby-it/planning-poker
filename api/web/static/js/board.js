import { COFFEE } from "./scale.js";

/**
 * The grid of voter cards.
 *
 * Rebuilds happen only when the set of voters changes. Everything that happens
 * within a round — someone voting, the reveal, a re-sort — mutates the existing
 * nodes, so the CSS transitions on a card actually have something to run
 * between and the FLIP animation has stable elements to move.
 */

const FLIP_DURATION_MS = 600;
const FLIP_EASING = "cubic-bezier(0.25, 0.8, 0.25, 1)";

function board() {
  return document.querySelector(".board");
}

// Usernames are visitor supplied, so cells are matched by reading the
// attribute rather than by interpolating one into a selector.
function cellOf(username) {
  const el = board();
  if (!el) return null;
  return Array.from(el.children).find(
    (cell) => cell.dataset.testid === `board-card-${username}`
  );
}

function cardOf(username) {
  return cellOf(username)?.querySelector(".card") ?? null;
}

/** Replaces the board with one cell per voter, in the given order. */
export function renderVoters(voters, { revealed, labels }) {
  const el = board();
  if (!el) return;

  el.replaceChildren(
    ...voters.map((voter) => {
      const cell = document.createElement("div");
      cell.className = "vote";
      cell.dataset.testid = `board-card-${voter.username}`;

      const card = document.createElement("div");
      card.className = "card";
      if (voter.voted && !revealed) card.classList.add("voted");
      if (revealed) card.classList.add("revealed");
      if (revealed && typeof voter.points === "number") {
        fillCard(card, voter.points, labels);
      }
      cell.appendChild(card);

      const name = document.createElement("span");
      name.className = "username";
      name.textContent = voter.username;
      cell.appendChild(name);

      return cell;
    })
  );
}

/** Flips a single card face down, without disturbing anything else. */
export function markVoted(username) {
  cardOf(username)?.classList.add("voted");
}

/** Turns every card face up and writes the vote onto it. */
export function revealVotes(votes, labels) {
  for (const [username, points] of Object.entries(votes)) {
    const card = cardOf(username);
    if (!card) continue;
    card.classList.remove("voted");
    card.classList.add("revealed");
    fillCard(card, points, labels);
  }
}

/** Clears the board back to the start of a round. */
export function clearVotes() {
  document.querySelectorAll(".board .card").forEach((card) => {
    card.classList.remove("voted", "revealed");
    card.replaceChildren();
  });
}

function fillCard(card, points, labels) {
  if (points === COFFEE) {
    const img = document.createElement("img");
    img.src = "/static/assets/cup-medium.svg";
    img.alt = labels.get(points) ?? "";
    card.replaceChildren(img);
    return;
  }
  const span = document.createElement("span");
  span.textContent = labels.get(points) ?? String(points);
  card.replaceChildren(span);
}

/**
 * Reorders the existing cells and slides them to their new places (FLIP:
 * measure, move, invert, then release).
 */
export function reorder(usernames) {
  const el = board();
  if (!el) return;

  const cells = new Map(
    Array.from(el.children).map((cell) => [
      cell.dataset.testid.replace("board-card-", ""),
      cell,
    ])
  );

  const first = new Map();
  cells.forEach((cell, username) =>
    first.set(username, cell.getBoundingClientRect())
  );

  // Appending an existing node moves it; the node itself survives, so its
  // transitions and animations are untouched.
  usernames.forEach((username) => {
    const cell = cells.get(username);
    if (cell) el.appendChild(cell);
  });

  cells.forEach((cell, username) => {
    const before = first.get(username);
    const after = cell.getBoundingClientRect();
    const dx = before.left - after.left;
    const dy = before.top - after.top;
    if (dx === 0 && dy === 0) return;

    cell.style.transition = "none";
    cell.style.transform = `translate(${dx}px, ${dy}px)`;

    requestAnimationFrame(() => {
      cell.style.transition = `transform ${FLIP_DURATION_MS}ms ${FLIP_EASING}`;
      cell.style.transform = "";
      const done = () => {
        cell.style.transition = "";
        cell.removeEventListener("transitionend", done);
      };
      cell.addEventListener("transitionend", done);
    });
  });
}

/**
 * Orders voters by their revealed points. Anyone without a vote sinks to the
 * bottom; ties are broken by name so the order is stable.
 */
export function sortVoters(voters, order) {
  return [...voters].sort((a, b) => {
    if (a.points === undefined && b.points === undefined) {
      return a.username.localeCompare(b.username);
    }
    if (a.points === undefined) return 1;
    if (b.points === undefined) return -1;
    if (a.points !== b.points) {
      return order === "asc" ? a.points - b.points : b.points - a.points;
    }
    return a.username.localeCompare(b.username);
  });
}
