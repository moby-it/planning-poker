import { runTest } from "./helpers/foundation.js";
import { TestChangeRole } from "./tests/changeRole.js";
import { createRoom } from "./tests/createRoom.js";
import { TestRevealRound } from "./tests/revealRound.js";
import { smokeTest } from "./tests/smoke.js";
import { TestVoting } from "./tests/vote.js";
import { voterJoinsRoom } from "./tests/voterJoinsRoom.js";
try {
  // setup
  /**
   * @type {(import('puppeteer').Browser)[]}
   */
  let browsers = [];
  let documents = [];
  const username = "fasolakis";
  await runTest("smoke test", () => smokeTest());
  const [roomId, chromeData] = await runTest(
    "User should be able to create room",
    () => createRoom(username)
  );

  browsers.push(chromeData.browser);
  documents.push(chromeData.$document);
  console.log("When a voter joins a room");
  const chromeData2 = await runTest(
    "\tA voter should be able to join the room",
    () => voterJoinsRoom(roomId, "fasolis")
  );
  browsers.push(chromeData2.browser);
  documents.push(chromeData2.$document);
  const chromeData3 = await runTest(
    "\tAnother voter should be able to join the room",
    () => voterJoinsRoom(roomId, "manolakis")
  );
  browsers.push(chromeData3.browser);
  documents.push(chromeData3.$document);
  //

  // Test Suits
  // order matters
  await TestChangeRole(documents, username);
  await TestVoting(documents);
  await TestRevealRound(documents, roomId);
  //

  // Teardown
  browsers.forEach(async (browser) => await browser.close());
  process.exit(0);
} catch (error) {
  console.error(error);
  console.error("TESTS FAILED \u2717");
  process.exit(1);
}
