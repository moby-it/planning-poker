import { z } from "zod";

const User = z.object({
  username: z.string(),
  isVoter: z.boolean(),
  hasVoted: z.boolean(),
});
const Pong = z.object({
  type: z.literal("pong"),
});
type Pong = z.infer<typeof Pong>;
export function isPong(data: unknown): data is Pong {
  const { success } = Pong.safeParse(data);
  return success;
}
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
export type RoundRevealed = z.infer<typeof RoundRevealed>;
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
const RoundToReveal = z.object({
  type: z.literal("roundToReveal"),
  after: z.number(),
});
export type RoundToReveal = z.infer<typeof RoundToReveal>;
export function isRoundToReveal(data: unknown): data is RoundToReveal {
  const { success } = RoundToReveal.safeParse(data);
  return success;
}
const RoundStarted = z.object({
  type: z.literal("roundStarted"),
});
type RoundStarted = z.infer<typeof RoundStarted>;
const CancelReveal = z.object({
  type: z.literal("cancelReveal"),
});
type CancelReveal = z.infer<typeof CancelReveal>;
export function isCancelReveal(data: unknown): data is CancelReveal {
  const { success } = CancelReveal.safeParse(data);
  return success;
}
export function isRoundStarted(data: unknown): data is RoundStarted {
  const { success } = RoundStarted.safeParse(data);
  return success;
}
