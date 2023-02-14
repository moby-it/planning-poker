package web

type User struct {
	Username string `json:"username"`
	IsVoter  bool   `json:"isVoter"`
}
type UsersUpdated struct {
	Users []User `json:"users"`
}

type UserVotedEvent struct {
	Username string `json:"username"`
}
type RoundRevealedEvent struct {
	Votes map[string]int `json:"votes"`
}
type RoundRevealAvailableEvent struct {
	RevealAvailable bool `json:"revealAvailable"`
}
