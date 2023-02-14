// Round represents a Poker Planning round for a single Story/Task
package web

import (
	"encoding/json"
	"errors"
	"log"
)

// A round always belongs to a room and has a certain number of votes
type Round struct {
	Room  *Room
	Votes map[string]int
}

func NewRound(room *Room) *Round {
	return &Round{Votes: make(map[string]int), Room: room}
}
func (r Round) isRevealable() {
	if len(r.Room.Voters) == len(r.Votes) {
		payload, err := json.Marshal(RoundRevealAvailableEvent{RevealAvailable: true})
		if err != nil {
			log.Println(err)
		}
		r.Room.broadcast <- payload
	}
}

func (r Round) revealRound() error {
	if len(r.Room.Voters) == len(r.Votes) {
		room := r.Room
		// reveal every vote from room Voters
		votes := make(map[string]int)
		for _, voter := range room.Voters {
			votes[voter.Username] = r.Votes[voter.Username]
		}
		payload, err := json.Marshal(RoundRevealedEvent{Votes: votes})
		if err != nil {
			return err
		}
		room.broadcast <- payload
	} else {
		return errors.New("not ready for reveal")
	}
	return nil
}
