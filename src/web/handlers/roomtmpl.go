package handlers

import (
	"html/template"
	"log"
	"net/http"

	"github.com/George-Spanos/poker-planning/business/room"
	"github.com/George-Spanos/poker-planning/web/render"
	"github.com/gorilla/mux"
)

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
		"room.html", "head.html", "header.html",
		"board.html", "button.html", "spectatorList.html",
		"subheader.html", "toggle.html", "votingCard.html",
		"votingCardList.html", "card.html",
	}
	tmpl, err := template.ParseFiles(addPrefix(roomTemplates)...)
	if err != nil {
		log.Fatalln(err)
		http.Error(w, "Unexpected error occured", http.StatusInternalServerError)
	}

	toggle := render.Toggle{Name: "isSpectator", TestId: "spectator-toggle", Checked: role == "spectator", Label: "Join as Spectator"}
	spectators := make([]render.Spectator, len(room.Spectators))
	for i := range room.Spectators {
		spectators[i] = render.Spectator{Name: room.Spectators[i].Username}
	}
	boardCards := render.BoardCards(room)

	roomData := render.RoomViewmodel{
		Subheader:  render.Subheader{Toggle: toggle},
		Spectators: spectators,
		BoardCards: boardCards, ShowLogo: true,
		VotingCards: render.VotingCards(room, username),
	}
	tmpl.Execute(w, roomData)

}
