package events

import (
	"bytes"
	"html/template"
	"log"

	"github.com/George-Spanos/poker-planning/business/room"
	"github.com/George-Spanos/poker-planning/business/user"
	"github.com/George-Spanos/poker-planning/web/render"
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

type Renderable interface {
	HTML(r *room.Room) string
}

type Event struct {
	Type string `json:"type"`
}
type UsersUpdatedEvent struct {
	Event
	Users []user.User `json:"users"`
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

func (e UsersUpdatedEvent) HTML(r *room.Room) string {
	tmpl, err := template.ParseFiles("web/static/templates/board.html", "web/static/templates/card.html")
	if err != nil {
		log.Fatalln("failed to parse templates for UsersUpdatedEvent")
	}
	cards := render.BoardCards(r)
	var buffer bytes.Buffer
	err = tmpl.ExecuteTemplate(&buffer, "board", cards)
	if err != nil {
		log.Fatalln("failed to parse templates for UserVotedEvent")
	}
	boardHtml := buffer.String()
	return boardHtml
}
func (e UserVotedEvent) HTML(r *room.Room) string {
	tmpl, err := template.ParseFiles("web/static/templates/board.html",
		"web/static/templates/card.html",
		"web/static/templates/votingCardList.html")
	if err != nil {
		log.Fatalln("failed to parse templates for UserVotedEvent")
	}
	cards := render.BoardCards(r)
	var buffer bytes.Buffer
	err = tmpl.ExecuteTemplate(&buffer, "board", cards)
	if err != nil {
		log.Fatalln("failed to parse board template for UserVotedEvent")
	}
	boardHtml := buffer.String()
	return boardHtml
}
func (e RoundRevealAvailableEvent) HTML(r *room.Room) string {
	tmpl, err := template.ParseFiles("web/static/templates/button.html")
	if err != nil {
		log.Fatalln("failed to parse templates for RoundRevealAvailableEvent")
	}
	btn := render.SubmitButton(r)
	var buffer bytes.Buffer
	err = tmpl.ExecuteTemplate(&buffer, "button", btn)
	if err != nil {
		log.Fatalln(err)
	}
	button := buffer.String()
	return button
}
