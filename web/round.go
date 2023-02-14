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

func NewRound() *Round {
	return &Round{Votes: make(map[string]int), Room: nil}
}
func (r Round) isReadyForReveal() bool {
	return len(r.Room.Voters) == len(r.Votes)
}
func (r Round) notifyUsers() error {
	var err error
	for _, client := range r.Room.Voters {
		err = client.Connection.WriteJSON(r.Votes)
		if err != nil {
			return err
		}
	}
	for _, client := range r.Room.Spectators {

		err = client.Connection.WriteJSON(r.Votes)
		if err != nil {
			return err
		}
	}
	return nil
}
func (r Round) revealRound() error {
	if r.isReadyForReveal() {
		err := r.notifyUsers()
		return err
	} else {
		return fmt.Errorf("not every user has voted")
	}
}
