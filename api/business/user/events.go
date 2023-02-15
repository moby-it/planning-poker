package user

const (
	UsersUpdated         = "usersUpdated"
	UserVoted            = "userVoted"
	RoundRevealed        = "roundRevealed"
	RoundRevealAvailable = "roundRevealAvailable"
)

type Event struct {
	Type string `json:"type"`
}

type UsersUpdatedEvent struct {
	Event
	Users []User `json:"users"`
}

type UserVotedEvent struct {
	Event
	Username    string `json:"username"`
	StoryPoints int    `json:"storyPoints"`
}
type RoundRevealedEvent struct {
	Event
	Votes map[string]int `json:"votes"`
}
type RoundRevealAvailableEvent struct {
	Event
	RevealAvailable bool `json:"revealAvailable"`
}
