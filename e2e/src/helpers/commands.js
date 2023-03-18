import { getDocument } from "pptr-testing-library";
import { queries } from "pptr-testing-library";
const url = process.env.URL || "http://localhost:3000";
const { getByTestId } = queries;
/**
 * @param {import('puppeteer').Browser} browser
 * @returns {Promise<{$document: ElementHandle<Element>,page: import('puppeteer').Page}>}
 */
export async function navigateToHome(browser) {
  const page = await browser.newPage();
  await page.goto(url);
  const $document = await getDocument(page);
  return { $document, page };
}
export async function navigateToRoom(browser, roomId) {
  const page = await browser.newPage();
  await page.goto(`${url}/room/${roomId}`);
  const $document = await getDocument(page);
  return { $document, page };
}
export async function fillCreateRoomForm($document, username, role = "voter") {
  const $usernameInput = await getByTestId($document, "username-input");
  await $usernameInput.type(username);
  if (role !== "voter") {
    const $roleInput = await getByTestId($document, "spectator-toggle");
    $roleInput.click();
  }
}
export async function submitCreateRoomForm($document) {
  const $createRoomButton = await getByTestId($document, "create-room");
  await $createRoomButton.click();
}
