package actions

const (
	UserToVote    = "userToVote"
	RoundToReveal = "roundToReveal"
	RoundToStart  = "roundToStart"
)

type Action struct {
	Type string `json:"type"`
}

type UserToVoteAction struct {
	Action
	Username    string `json:"username"`
	StoryPoints int    `json:"storyPoints"`
}
type RoundToRevealAction struct {
	Action
}
type RoundToStartAction struct {
	Action
}
