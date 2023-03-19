import {
  ChangeRole,
  ShouldHaveNVoters,
  UserIsSpectator,
  UserIsVoter,
} from "../helpers/commands.js";
import { runTest } from "../helpers/foundation.js";

export async function TestChangeRole(documents, username) {
  console.log("Test Change Role");
  if (documents.length < 2) throw new Error("Not enough documents");
  if (!username) throw new Error("No username provided");
  await runTest("\tA user should be able to change their role", () =>
    ChangeRole(documents[0], "spectator")
  );
  await runTest("\t\tUser should be spectator", () =>
    UserIsSpectator(documents[1], username)
  );
  for (const document of documents) {
    await runTest("\tUser should see 2 voters", () =>
      ShouldHaveNVoters(document, 2)
    );
  }
  await runTest("\tA user should be able to change their role", () =>
    ChangeRole(documents[0], "voter")
  );
  await runTest("\t\tUser should be voter", () =>
    UserIsVoter(documents[1], username)
  );
}
