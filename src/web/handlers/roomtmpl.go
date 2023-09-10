package handlers

import (
	"html/template"
	"log"
	"net/http"

	"github.com/George-Spanos/poker-planning/business/room"
	"github.com/gorilla/mux"
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

func ServeRoom(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	roomId, ok := vars["roomId"]
	if !ok {
		log.Println("missing room id from request")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	room, found := room.Get(roomId)
	if !found {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}
	username := r.URL.Query().Get("username")
	if username == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	role := r.URL.Query().Get("role")
	if role == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	roomTemplates := []string{
		"web/templates/room.html", "web/templates/head.html", "web/templates/header.html",
		"web/templates/board.html", "web/templates/button.html", "web/templates/spectatorList.html",
		"web/templates/subheader.html", "web/templates/toggle.html", "web/templates/votingCard.html",
		"web/templates/votingCardList.html", "web/templates/card.html",
	}
	tmpl, err := template.ParseFiles(roomTemplates...)
	if err != nil {
		log.Fatalln(err)
		http.Error(w, "Unexpected error occured", http.StatusInternalServerError)
	}

	toggle := Toggle{Name: "isSpectator", TestId: "spectator-toggle", Checked: role == "spectator", Label: "Join as Spectator"}
	spectators := make([]Spectator, len(room.Spectators))
	for i := range room.Spectators {
		spectators[i] = Spectator{Name: room.Spectators[i].Username}
	}
	boardCards := createBoardCards(room)

	roomData := RoomData{Subheader: Subheader{Toggle: toggle}, Spectators: spectators, BoardCards: boardCards}
	tmpl.Execute(w, roomData)

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
