/**
 * The band above the board. It shows where the round is up to: an invitation
 * to vote, a countdown, or the result.
 */

const HEADINGS = {
  Started: "Voting is in session!",
  Revealable: "Everyone's Ready",
  Revealing: "Revealing in",
};

const PROGRESS_TICK_MS = 20;

let countdown = null;
let progress = null;

function header() {
  return document.querySelector(".room-header");
}

/** Stops any timer this module owns. Safe to call at any point. */
export function stop() {
  clearInterval(countdown);
  clearInterval(progress);
  countdown = null;
  progress = null;
}

function setHeading(text) {
  const el = header();
  if (!el) return;
  let heading = el.querySelector("h2");
  if (!heading) {
    heading = document.createElement("h2");
    el.replaceChildren(heading);
  }
  heading.textContent = text;
}

export function showVoting() {
  stop();
  header()?.replaceChildren();
  setHeading(HEADINGS.Started);
}

export function showReady() {
  stop();
  header()?.replaceChildren();
  setHeading(HEADINGS.Revealable);
}

/** Counts down to the reveal, with a bar draining alongside it. */
export function showRevealing(durationMs) {
  stop();
  const el = header();
  if (!el) return;
  el.replaceChildren();

  let remaining = Math.round(durationMs / 1000);
  setHeading(`${HEADINGS.Revealing} ${remaining}`);
  countdown = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      clearInterval(countdown);
      countdown = null;
      return;
    }
    setHeading(`${HEADINGS.Revealing} ${remaining}`);
  }, 1000);

  const track = document.createElement("div");
  track.id = "progress-bar";
  const bar = document.createElement("div");
  bar.id = "bar";
  bar.style.width = "100%";
  track.appendChild(bar);
  el.appendChild(track);

  const startedAt = Date.now();
  progress = setInterval(() => {
    const width = Math.max(100 - ((Date.now() - startedAt) / durationMs) * 100, 0);
    bar.style.width = `${width}%`;
    if (width <= 0) {
      clearInterval(progress);
      progress = null;
    }
  }, PROGRESS_TICK_MS);
}

/**
 * Swaps in the result panel, cloned from the template the server rendered.
 * Scales whose numbers are only an ordering get a verdict but no average.
 */
export function showRevealed(stats, { onSort, sortOrder }) {
  stop();
  const el = header();
  const template = document.getElementById("revealed-template");
  if (!el || !template) return;

  const content = template.content.cloneNode(true);

  if (!stats.numeric) {
    content
      .querySelectorAll('[data-stat="average"], [data-stat="standardDeviation"]')
      .forEach((node) => node.remove());
  }

  setValue(content, "average", stats.average);
  setValue(content, "standardDeviation", stats.standardDeviation);
  setValue(content, "verdict", stats.verdict);

  content.querySelectorAll(".sort-icon-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.sort === sortOrder);
    button.addEventListener("click", () => onSort(button.dataset.sort));
  });

  el.replaceChildren(content);
}

/** Marks which sort button is active without rebuilding the panel. */
export function markSort(sortOrder) {
  document.querySelectorAll(".sort-icon-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.sort === sortOrder);
  });
}

function setValue(root, stat, value) {
  const item = root.querySelector(`.item[data-stat="${stat}"] .value`);
  if (item) item.textContent = value;
}
