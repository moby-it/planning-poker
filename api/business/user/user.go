package user

import (
	"sync"

	"github.com/gorilla/websocket"
)

type User struct {
	Username string `json:"username"`
	IsVoter  bool   `json:"isVoter"`
	HasVoted bool   `json:"hasVoted"`
}
type Connection struct {
	*websocket.Conn
	Mu sync.RWMutex
	User
}
