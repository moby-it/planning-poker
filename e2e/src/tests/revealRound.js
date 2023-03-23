import {
  CancelRoundReveal,
  NotReadToReaveal,
  ReadyToReveal,
  RevealingRound,
  RevealRound,
  RoundRevealed,
  StartNewRound,
  TryChangeRole,
} from "../helpers/commands.js";
import { runTest } from "../helpers/foundation.js";
import { voterJoinsRoom } from "./voterJoinsRoom.js";

export async function TestRevealRound(documents, roomId) {
  console.log("Test Reveal Round");
  if (documents.length < 2) throw new Error("Not enough documents");
  if (!roomId) throw new Error("No roomId provided");
  for (const document of documents) {
    await runTest("\tround should be revealable", () =>
      ReadyToReveal(document)
    );
  }
  await runTest("\t\tA user should be able start the round reveal", () =>
    RevealRound(documents[0])
  );
  for (const document of documents) {
    await runTest("\t\tAll users should see the cancel button", () =>
      RevealingRound(document)
    );
  }
  await runTest("\t\tA user should be able to cancel the reveal", () =>
    CancelRoundReveal(documents[1])
  );
  console.log("\tAfter a user cancels the reveal");
  for (const document of documents) {
    await runTest("\t\tRound reveals should be available", async () =>
      ReadyToReveal(document)
    );
  }
  await runTest("\t\tA user should be able start the round reveal again", () =>
    RevealRound(documents[0])
  );
  console.log("\t After a new user joins the room");
  const { browser } = await voterJoinsRoom(roomId, "george");
  for (const document of documents) {
    await runTest("\tRound reveal should get canceled", () =>
      NotReadToReaveal(document)
    );
  }
  await browser.close();
  console.log("\t After the new user leaves the room");
  for (const document of documents) {
    await runTest("\tRound reveal should be available", () =>
      ReadyToReveal(document)
    );
  }
  await runTest("\t\tA user should be able start the round reveal again", () =>
    RevealRound(documents[0])
  );
  await runTest(
    "\t\tuser should not be able to change role during reveal",
    () => TryChangeRole(documents[0], "spectator", false)
  );
  await runTest(
    "\tAfter 5 seconds the round should be revealed",
    () =>
      new Promise((resolve) =>
        setTimeout(() => {
          RoundRevealed(documents[0]);
          resolve();
        }, 5000)
      )
  );
  console.log("\tAfter the round is revealed");

  const { $document } = await voterJoinsRoom(roomId, "maria");
  for (const document of [...documents, $document]) {
    await runTest("\tRound reveal should still be revealed", () => {
      RoundRevealed(document);
    });
  }
  await runTest("\tShould be able to start new Round", () =>
    StartNewRound(documents[0])
  );
}
