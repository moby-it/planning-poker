package actions

const (
	UserToVote    = "userToVote"
	RoundToReveal = "roundToReveal"
	CancelReveal  = "cancelReveal"
	RoundToStart  = "roundToStart"
	ChangeRole    = "changeRole"
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
type CancelRevealAction struct {
	Action
}
type ChangeRoleAction struct {
	Action
	Username string `json:"username"`
	Role     string `json:"role"`
}
type RoundToStartAction struct {
	Action
}
