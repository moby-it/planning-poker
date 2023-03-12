import { z } from "zod";

const User = z.object({
  username: z.string(),
  isVoter: z.boolean(),
  hasVoted: z.boolean(),
});

const UsersUpdated = z.object({
  type: z.literal("usersUpdated"),
  users: z.array(User),
});
type UsersUpdated = z.infer<typeof UsersUpdated>;
export function isUsersUpdated(data: unknown): data is UsersUpdated {
  const { success } = UsersUpdated.safeParse(data);
  return success;
}

const UserVoted = z.object({
  type: z.literal("userVoted"),
  username: z.string(),
});
type UserVoted = z.infer<typeof UserVoted>;
export function isUserVoted(data: unknown): data is UserVoted {
  const { success } = UserVoted.safeParse(data);
  return success;
}

const RoundRevealed = z.object({
  type: z.literal("roundRevealed"),
  votes: z.record(z.string(), z.number()),
});
type RoundRevealed = z.infer<typeof RoundRevealed>;
export function isRoundRevealed(data: unknown): data is RoundRevealed {
  const { success } = RoundRevealed.safeParse(data);
  return success;
}

const RoundRevealAvailable = z.object({
  type: z.literal("roundRevealAvailable"),
  revealAvailable: z.boolean(),
});
type RoundRevealAvailable = z.infer<typeof RoundRevealAvailable>;

export function isRoundRevealAvailable(
  data: unknown
): data is RoundRevealAvailable {
  const { success } = RoundRevealAvailable.safeParse(data);
  return success;
}

const RoundStarted = z.object({
  type: z.literal("roundStarted"),
});
type RoundStarted = z.infer<typeof RoundStarted>;
export function isRoundStarted(data: unknown): data is RoundStarted {
  const { success } = RoundStarted.safeParse(data);
  return success;
}
