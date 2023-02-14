// Round represents a Poker Planning round for a single Story/Task
package web

import (
	"fmt"
)

// A round always belongs to a room and has a certain number of votes
type Round struct {
	Room  *Room
	Votes map[string]int
}

func NewRound(room *Room) *Round {
	return &Round{Votes: make(map[string]int), Room: room}
}
func (r Round) isReadyForReveal() bool {
	return len(r.Room.Voters) == len(r.Votes)
}

func (r Round) revealRound() error {
	if r.isReadyForReveal() {
		err := r.Room.notifyUsers()
		return err
	} else {
		return fmt.Errorf("not every user has voted")
	}
}
