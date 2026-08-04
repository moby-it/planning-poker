import { navigate } from "./router.js";

/**
 * The landing page. The intro animation is pure CSS; all this does is send the
 * visitor onwards and let an impatient one skip the show.
 */
export function initHome() {
  const home = document.querySelector(".home");
  const startHere = document.getElementById("start-here");

  // The whole wrapper is the target, not just the button inside it.
  startHere?.addEventListener("click", () => navigate("/prejoin?create=true"));
  home?.addEventListener("click", () => home.classList.add("rushed"));
}
