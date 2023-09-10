package events

import (
	"log"

	"github.com/George-Spanos/poker-planning/business/room"
)

const (
	UsersUpdated         = "usersUpdated"
	UserVoted            = "userVoted"
	RoundToReveal        = "roundToReveal"
	CancelReveal         = "cancelReveal"
	RoundRevealed        = "roundRevealed"
	RoundRevealAvailable = "roundRevealAvailable"
	RoundStarted         = "roundStarted"
	Pong                 = "pong"
)

type Broadcastable interface {
	Html(room *room.Room) string
	UserVotedEvent | RoundRevealedEvent | RoundRevealAvailableEvent | RoundStartedEvent | UsersUpdatedEvent | CancelRevealEvent | RoundToRevealEvent
}
type Event struct {
	Type string `json:"type"`
}
type PongEvent struct {
	Event
}
type UserVotedEvent struct {
	Event
	Username string `json:"username"`
}
type RoundRevealedEvent struct {
	Event
	Votes map[string]int `json:"votes"`
}
type RoundRevealAvailableEvent struct {
	Event
	RevealAvailable bool `json:"revealAvailable"`
}
type RoundToRevealEvent struct {
	Event
	After int `json:"after"` // in seconds
}

type CancelRevealEvent struct {
	Event
}
type RoundStartedEvent struct {
	Event
}

func Broadcast[T Broadcastable](event T, room *room.Room) {
	for _, connection := range room.Connections() {
		connection.Mu.Lock()
		defer connection.Mu.Unlock()
		if err := connection.WriteMessage(1, []byte(event.Html(room))); err != nil {
			log.Println(err)
		}
	}
}
