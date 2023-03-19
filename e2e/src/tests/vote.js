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
  console.log("Test Voting");
  for (const document of documents) {
    await runTest("\tround should not be revealable", () =>
      NotReadToReaveal(document)
    );
  }
  console.log("\tAfter 3 voters joined");
  await runTest("\t\tRoom should have 3 voters", () =>
    ShouldHaveNVoters(fasolakisDocument, 3)
  );
  await runTest(
    "\t\tA voter should be able to vote",
    async () => await Vote(fasolisDocument, "1")
  );
  await runTest(
    "\t\tA voter should be able to vote",
    async () => await Vote(manolakisDocument, "2")
  );
  for (const document of documents) {
    await runTest("\t\tRound reveals should not be available", async () =>
      NotReadToReaveal(document)
    );
  }
  await runTest(
    "\t\tA voter should be able to vote",
    async () => await Vote(fasolakisDocument, "3")
  );
  for (const document of documents) {
    await runTest("\t\tRound reveals should be available", () =>
      ReadyToReveal(document)
    );
  }
  console.log("\tAfter a voter votes");
  await runTest(
    "\t\tVoter should see the vote",
    async () => await UserVoted(fasolisDocument, "fasolakis")
  );
  await runTest(
    "\t\tVoter should see the vote",
    async () => await UserVoted(manolakisDocument, "fasolakis")
  );
}
