package handlers

import (
	"html/template"
	"log"
	"net/http"

	"github.com/George-Spanos/poker-planning/business/room"
	"github.com/gorilla/mux"
)

type Card struct {
	Classes string
	Points  string
}
type Spectator struct {
	Name string
}
type Button struct {
	Text    string
	Show    bool
	Classes string
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
	Button
	Spectators  []Spectator
	VotingCards []Card
	BoardCards  []Card
}

func ServeRoom(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	roomId, ok := vars["roomId"]
	if !ok {
		log.Println("missing room id from request")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	_, found := room.Get(roomId)
	if !found {
		w.WriteHeader(http.StatusNotFound)
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

	toggle := Toggle{Name: "isSpectator", TestId: "spectator-toggle", Checked: true, Label: "Join as Spectator"}
	roomData := RoomData{Subheader: Subheader{Toggle: toggle}}
	tmpl.Execute(w, roomData)

}
