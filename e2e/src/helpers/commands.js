import { getDocument, queries, waitFor } from "pptr-testing-library";
const url = process.env.URL || "http://localhost:3000";
const { getByTestId } = queries;
/**
 * @param {import('puppeteer').Browser} browser
 * @returns {Promise<{$document: ElementHandle<Element>,page: import('puppeteer').Page}>}
 */
export async function NavigateToHome(browser) {
  const page = await browser.newPage();
  await page.goto(url);
  const $document = await getDocument(page);
  return { $document, page };
}
export async function NavigateToRoom(browser, roomId) {
  const page = await browser.newPage();
  await page.goto(`${url}/room/${roomId}`);
  const $document = await getDocument(page);
  return { $document, page };
}
export async function FillCreateRoomForm($document, username, role = "voter") {
  const $usernameInput = await getByTestId($document, "username-input");
  await $usernameInput.type(username);
  if (role !== "voter") {
    const $roleInput = await getByTestId($document, "spectator-toggle");
    $roleInput.click();
  }
}
export async function SubmitCreateRoomForm($document) {
  const $createRoomButton = await getByTestId($document, "create-room");
  await $createRoomButton.click();
}
export async function Vote($document, points) {
  const $voteButton = await getByTestId($document, `voting-card-${points}`);
  await $voteButton.click();
}
export async function ShouldHaveNVoters($document, n) {
  const $votes = await $document.$$(".card");
  return $votes.length === n;
}
export async function ChangeRole($document, role) {
  const $roleInput = await getByTestId($document, "spectator-toggle");
  const checked = $roleInput.toElement().checked;
  if (role === "voter" && checked) {
    await $roleInput.click();
  } else if (role === "spectator" && !checked) {
    await $roleInput.click();
  }
}
export async function UserIsSpectator($document, username) {
  try {
    await getByTestId($document, `spectator-${username}`);
    return true;
  } catch (e) {
    return false;
  }
}
export async function UserVoted($document, username) {
  try {
    const $card = await getByTestId($document, `board-card-${username}`);
    await $card.$$(".voted");
    return true;
  } catch (e) {
    return false;
  }
}
export async function RevealRound($document) {
  const $revealButton = getByTestId($document, "reveal-button");
  await $revealButton.click();
}
export async function RoundRevealed($document) {
  try {
    await waitFor(() => getByTestId($document, "Average Score"), {
      timeout: 7000,
    });
    return true;
  } catch (e) {
    return false;
  }
}
async function IsReadyToReveal($document) {
  try {
    await waitFor(() => getByTestId($document, "reveal-round"), {
      timeout: 500,
      interval: 100,
    });
    return true;
  } catch (e) {
    return false;
  }
}
export async function ReadyToReveal($document) {
  const isReady = await IsReadyToReveal($document);
  if (!isReady) throw new Error("Not ready to reveal");
}
export async function NotReadToReaveal($document) {
  const isReady = await IsReadyToReveal($document);
  if (isReady) throw new Error("Ready to reveal");
}
export async function StartNewRound($document) {
  const $startNewRoundButton = getByTestId($document, "start-new-round");
  await $startNewRoundButton.click();
}
export async function CancelRoundReveal($document) {
  const $cancelButton = getByTestId($document, "cancel-reveal");
  await $cancelButton.click();
}
