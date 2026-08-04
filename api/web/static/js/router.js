/**
 * A very small client router.
 *
 * Every route is a real server-rendered page, so a deep link, a refresh or a
 * crawler all work without JavaScript doing anything. What this adds is moving
 * between routes without tearing the document down: it fetches the next page,
 * lifts its #app subtree in, and updates history. That keeps long-lived state —
 * most importantly an open websocket's page context — from being destroyed by
 * a navigation the visitor did not really need.
 */

/** @type {Array<{match: (path: string) => boolean, init: () => (() => void) | void}>} */
let routes = [];

/** Teardown for the route currently on screen. */
let teardown = null;

function app() {
  return document.getElementById("app");
}

function runRoute() {
  const path = window.location.pathname;
  const route = routes.find((r) => r.match(path));
  if (!route) return;
  const result = route.init();
  teardown = typeof result === "function" ? result : null;
}

function leaveRoute() {
  if (teardown) {
    teardown();
    teardown = null;
  }
}

async function swap(url) {
  const response = await fetch(url, { headers: { Accept: "text/html" } });
  const html = await response.text();
  const next = new DOMParser()
    .parseFromString(html, "text/html")
    .getElementById("app");

  if (!next) throw new Error(`no #app in the response for ${url}`);
  app().replaceChildren(...next.childNodes);

  // A route may have redirected us (an expired room sends us home), so the
  // address bar should show where we actually ended up.
  return response.redirected
    ? new URL(response.url).pathname + new URL(response.url).search
    : url;
}

/**
 * Move to url without reloading the document.
 *
 * @param {string} url
 * @param {{replace?: boolean}} [options]
 */
export async function navigate(url, { replace = false } = {}) {
  leaveRoute();

  let landed;
  try {
    landed = await swap(url);
  } catch (e) {
    // If the swap fails there is nothing sensible left on screen, so fall back
    // to a real navigation and let the browser report the problem.
    console.error(e);
    window.location.href = url;
    return;
  }

  if (replace) {
    history.replaceState({}, "", landed);
  } else {
    history.pushState({}, "", landed);
  }
  window.scrollTo(0, 0);
  runRoute();
}

function onClick(event) {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const link = event.target.closest("a[data-link]");
  if (!link) return;

  const href = link.getAttribute("href");
  if (!href || href.startsWith("http") || link.target === "_blank") return;

  event.preventDefault();
  navigate(href);
}

async function onPopState() {
  leaveRoute();
  try {
    await swap(window.location.pathname + window.location.search);
  } catch (e) {
    console.error(e);
    window.location.reload();
    return;
  }
  runRoute();
}

/**
 * @param {Array<{match: (path: string) => boolean, init: () => (() => void) | void}>} definitions
 */
export function start(definitions) {
  routes = definitions;
  document.addEventListener("click", onClick);
  window.addEventListener("popstate", onPopState);
  runRoute();
}
