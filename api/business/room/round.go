// Round represents a Poker Planning round for a single Story/Task
package room

// A round always belongs to a room and has a certain number of votes
type Round struct {
	Votes    map[string]int
	Revealed bool
}

func NewRound() *Round {
	return &Round{Votes: make(map[string]int), Revealed: false}
}

func (r Round) IsRevealable(voters int) bool {
	return voters > 0 && voters == len(r.Votes)
}
