package render

import "github.com/George-Spanos/poker-planning/business/room"

type VoteCard struct {
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
type Button struct {
	Text     string
	Swap     string
	Disabled bool
	TestId   string
}
type RoomViewmodel struct {
	ShowLogo bool
	Subheader
	Spectators []Spectator
	BoardCards []VoteCard
}

func CreateBoardCards(room *room.Room) []VoteCard {
	boardCards := make([]VoteCard, len(room.Voters))

	for i := range room.Voters {
		username := room.Voters[i].Username
		boardCards[i] = VoteCard{Username: username}
		if room.CurrentRound.Revealed {
			boardCards[i].Classes += "revealed"
			if vote, found := room.CurrentRound.Votes[username]; found {
				boardCards[i].Points = vote
			} else {
				boardCards[i].Points = -1
			}
		} else if room.UserHasVoted(username) {
			boardCards[i].Classes += "voted"
		}

	}
	return boardCards
}
