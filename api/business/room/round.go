// Round represents a Poker Planning round for a single Story/Task
package room

// A round always belongs to a room and has a certain number of votes
type Round struct {
	Votes map[string]int
}

func NewRound() *Round {
	return &Round{Votes: make(map[string]int)}
}

func (r Round) IsRevealable(currentVotes int) bool {
	return currentVotes > 0 && currentVotes == len(r.Votes)
}
