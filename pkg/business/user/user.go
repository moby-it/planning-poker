package user

type User struct {
	Username string `json:"username"`
	IsVoter  bool   `json:"isVoter"`
	HasVoted bool   `json:"hasVoted"`
}
