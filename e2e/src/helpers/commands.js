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

/**
 *
 * @param {import('puppeteer').ElementHandle<Element>} $document
 * @param {*} role
 */
export async function ChangeRole($document, role) {
  const $roleInput = await getByTestId($document, "spectator-toggle");

  const checked = await $roleInput.evaluate((el) => el.checked);
  if (role === "voter" && checked) {
    await $document.$eval("input[data-testid='spectator-toggle']", (el) =>
      el.click()
    );
  } else if (role === "spectator" && !checked) {
    await $document.$eval("input[data-testid='spectator-toggle']", (el) =>
      el.click()
    );
  }
}
export async function TryChangeRole($document, role, expectedResult) {
  const $roleInput = await getByTestId($document, "spectator-toggle");
  const beforeChecked = await $roleInput.evaluate((el) => el.checked);
  await ChangeRole($document, role);
  const afterChecked = await $roleInput.evaluate((el) => el.checked);
  if (
    (expectedResult && beforeChecked === afterChecked) ||
    (!expectedResult && beforeChecked !== afterChecked)
  )
    throw new Error("Unexpected result when chaging role");
}
export async function UserIsSpectator($document, username) {
  try {
    await getByTestId($document, `spectator-${username}`);
    return true;
  } catch (e) {
    return false;
  }
}
export async function UserIsVoter($document, username) {
  try {
    await getByTestId($document, `board-card-${username}`);
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
  const $revealButton = await getByTestId($document, "reveal-round");
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
async function isReadyToReveal($document) {
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
  const isReady = await isReadyToReveal($document);
  if (!isReady) throw new Error("Not ready to reveal");
}
export async function NotReadToReaveal($document) {
  const isReady = await isReadyToReveal($document);
  if (isReady) throw new Error("Ready to reveal");
}
export async function RevealingRound($document) {
  await waitFor(() => getByTestId($document, "cancel-reveal"), {
    timeout: 2000,
  });
}
export async function StartNewRound($document) {
  const $startNewRoundButton = await getByTestId($document, "start-new-round");
  await $startNewRoundButton.click();
}
export async function CancelRoundReveal($document) {
  const $cancelButton = await getByTestId($document, "cancel-reveal");
  await $cancelButton.click();
}
