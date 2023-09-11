package render

import (
	"github.com/George-Spanos/poker-planning/business/room"
	"github.com/George-Spanos/poker-planning/web/websockets/actions"
)

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
	Text      string
	Swap      string
	TestId    string
	Classes   string
	EventType string
}
type RoomViewmodel struct {
	ShowLogo bool
	Subheader
	Spectators  []Spectator
	BoardCards  []VoteCard
	VotingCards []VoteCard
}

func BoardCards(room *room.Room) []VoteCard {
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
func SubmitButton(room *room.Room) Button {
	button := Button{Swap: "#submit-btn"}
	if room.CancelReveal != nil {
		button.Text = "Cancel Reveal"
		button.TestId = "cancel-reveal"
		button.Classes = "btn default"
		button.EventType = actions.CancelReveal
		return button
	}
	if room.CurrentRound.IsRevealable(len(room.Voters)) {
		button.Text = "Reveal Round"
		button.TestId = "reveal-round"
		button.Classes = "btn primary"
		button.EventType = actions.RoundToReveal
		return button
	}
	if room.CurrentRound.Revealed {
		button.Text = "Start New Round"
		button.TestId = "start-new-round"
		button.Classes = "btn primary"
		button.EventType = actions.RoundToStart
		return button
	}
	button.Classes = "hidden"
	return button
}

func VotingCards(r *room.Room, username string) []VoteCard {
	storyPoints := []int{0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 100, 1000}
	votingCards := make([]VoteCard, len(storyPoints))
	for i := range storyPoints {
		card := VoteCard{Points: storyPoints[i], Classes: "voting-card"}
		vote, found := r.CurrentRound.Votes[username]
		if found && vote == storyPoints[i] {
			card.Classes += " selected"
		}
		votingCards[i] = card
	}
	return votingCards
}
