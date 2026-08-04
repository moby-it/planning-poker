package handlers

import (
	"net/http"

	"github.com/George-Spanos/poker-planning/business/room"
	"github.com/George-Spanos/poker-planning/business/scales"
	"github.com/George-Spanos/poker-planning/web/render"
	"github.com/gorilla/mux"
)

// ServeHome renders the landing page.
func ServeHome(w http.ResponseWriter, r *http.Request) {
	render.Page(w, "home", nil)
}

type prejoinPage struct {
	// Creating distinguishes "make me a room" from "let me into this one".
	Creating bool
	RoomId   string
	Scales   []scales.Scale
}

// ServePrejoin renders the form a visitor fills in before entering a room.
// ?create=true asks for a new room, otherwise ?roomId names the room to join.
func ServePrejoin(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	roomId := query.Get("roomId")
	// Creating is the default: arriving here without a room to join can only
	// mean the visitor wants a new one.
	creating := query.Get("create") == "true" || roomId == ""

	render.Page(w, "prejoin", prejoinPage{
		Creating: creating,
		RoomId:   roomId,
		Scales:   scales.All(),
	})
}

type roomPage struct {
	RoomId string
	Scale  scales.Scale
}

// ServeRoom renders a room's shell, already populated with the voting cards of
// the scale it was created with. A room that no longer exists sends the visitor
// home rather than showing them a board nobody will ever join.
func ServeRoom(w http.ResponseWriter, r *http.Request) {
	roomId := mux.Vars(r)["roomId"]
	existing, found := room.Get(roomId)
	if !found {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	render.Page(w, "room", roomPage{
		RoomId: roomId,
		Scale:  scales.Get(existing.Scale),
	})
}
