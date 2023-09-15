package endpoints

import (
	"github.com/George-Spanos/poker-planning/pkg/business/room"
)

type Card struct {
	Classes  string
	Points   int
	Username string
}
type Spectator struct {
	Name string
}
type Toggle struct {
	Label   string
	Name    string
	TestId  string
	Checked bool
}
type Subheader struct {
	Toggle Toggle
}
type RoomData struct {
	Subheader
	Spectators []Spectator
	BoardCards []Card
}

func createBoardCards(room *room.Room) []Card {
	boardCards := make([]Card, len(room.Voters))

	for i := range room.Voters {
		username := room.Voters[i].Username
		boardCards[i] = Card{Username: username}
		if room.CurrentRound.Revealed {
			boardCards[i].Classes += "revealed"
			if vote, found := room.CurrentRound.Votes[username]; found {
				boardCards[i].Points = vote
			}
		} else if room.UserHasVoted(username) {
			boardCards[i].Classes += "voted"
		}

	}
	return boardCards
}
