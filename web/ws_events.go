package web

type UserConnectedEvent struct {
	Username string
	Voter    bool
}

type UserVotedEvent struct {
	Username string
}
type RoundRevealedEvent struct {
	Votes map[string]int
}
type RoundRevealAvailableEvent struct {
}
