/**
 * The room's scale, read back out of the markup the server rendered.
 *
 * The voting cards are the scale, so there is no need to ship it a second time
 * as data: whatever the visitor can click is exactly what the server thinks the
 * room offers.
 */

/** The break card, which is drawn rather than written. */
export const COFFEE = 1000;

/** @returns {Map<number, string>} card value to the label the voter saw */
export function labels() {
  const map = new Map();
  document.querySelectorAll(".voting-card").forEach((card) => {
    map.set(Number(card.dataset.value), card.dataset.label);
  });
  return map;
}
