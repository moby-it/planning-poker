import { runTest } from "./helpers/foundation.js";
import { createRoom } from "./tests/createRoom.js";
import { smokeTest } from "./tests/smoke.js";
import { voterJoinsRoom } from "./tests/voterJoinsRoom.js";
try {
  await runTest(smokeTest);
  const [roomId, browser] = await runTest(
    createRoom("fasolakis"),
    createRoom.name
  );
  const [browser2] = await runTest(
    voterJoinsRoom(roomId, "fasolis"),
    voterJoinsRoom.name
  );
  await browser.close();
  await browser2.close();
  process.exit(0);
} catch (error) {
  console.error(error);
  console.error("TESTS FAILED \u2717");
  process.exit(1);
}
