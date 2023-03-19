import {
  NotReadToReaveal,
  ReadyToReveal,
  ShouldHaveNVoters,
  UserVoted,
  Vote,
} from "../helpers/commands.js";
import { runTest } from "../helpers/foundation.js";

export async function TestVoting(documents) {
  const [fasolakisDocument, fasolisDocument, manolakisDocument] = documents;
  for (const document of documents) {
    await runTest("round should not be revealable", () =>
      NotReadToReaveal(document)
    );
  }
  console.log("After 3 voters joined");
  await runTest("\tRoom should have 3 voters", () =>
    ShouldHaveNVoters(fasolakisDocument, 3)
  );
  await runTest(
    "\tA voter should be able to vote",
    async () => await Vote(fasolisDocument, "1")
  );
  await runTest(
    "\tA voter should be able to vote",
    async () => await Vote(manolakisDocument, "2")
  );
  for (const document of documents) {
    await runTest("\tRound reveals should not be available", async () =>
      NotReadToReaveal(document)
    );
  }
  await runTest(
    "\tA voter should be able to vote",
    async () => await Vote(fasolakisDocument, "3")
  );
  for (const document of documents) {
    await runTest("\tRound reveals should be available", () => ReadyToReveal(document));
  }
  console.log("After a voter votes");
  await runTest(
    "\tVoter should see the vote",
    async () => await UserVoted(fasolisDocument, "fasolakis")
  );
  await runTest(
    "\tVoter should see the vote",
    async () => await UserVoted(manolakisDocument, "fasolakis")
  );
}
