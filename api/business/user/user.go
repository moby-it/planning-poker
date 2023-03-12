package user

import (
	"github.com/gorilla/websocket"
)

type User struct {
	Username string `json:"username"`
	IsVoter  bool   `json:"isVoter"`
	HasVoted bool   `json:"hasVoted"`
}
type Connection struct {
	*websocket.Conn
	User
}
