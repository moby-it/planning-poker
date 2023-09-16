package endpoints

import (
	"errors"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"strings"

	"github.com/George-Spanos/poker-planning/pkg/business/room"
	"github.com/George-Spanos/poker-planning/pkg/business/user"
	"github.com/George-Spanos/poker-planning/pkg/web/render"
	"github.com/George-Spanos/poker-planning/pkg/web/websockets"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

var (
	ErrInvalidUsername   = errors.New("invalid username from request")
	ErrInvalidRole       = errors.New("invalid role")
	ErrDuplicateUsername = errors.New("duplicate username in room")
	ErrRoomNotFound      = errors.New("room id not found")
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func ConnectToRoom(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	roomId, username, role, err := validateRoomRequest(vars)
	if err != nil {
		log.Println(err.Error())
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(err.Error()))
		return
	}
	currentRoom, roomExists := room.Get(roomId)
	if roomExists {
		if currentRoom.IncludeUsername(username) {
			log.Println("username already exists")
			w.WriteHeader(http.StatusConflict)
			w.Write([]byte(ErrDuplicateUsername.Error()))
			return
		}
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println("error upgrading connection to websocket", err.Error())
			w.Write([]byte(err.Error()))
			return
		}
		u := user.User{Username: username, IsVoter: role == "voter"}
		websockets.AddClient(u, conn, currentRoom)

	} else {
		log.Println(ErrRoomNotFound.Error())
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte(ErrRoomNotFound.Error()))
	}
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
	if username == "" || room.IncludeUsername(username) {
		http.Redirect(w, r, fmt.Sprintf("/prejoin?roomId=%s", roomId), http.StatusSeeOther)
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

// takes a map with the route params
//
// returns the roomId, username, role, error
func validateRoomRequest(vars map[string]string) (string, string, string, error) {
	var errs = make([]error, 0)
	// not validating if vars exists since mux returns 404 if they don't
	roomId := vars["roomId"]
	username, ok := vars["username"]
	trmUsername := strings.TrimSpace(username)
	if !ok || len(trmUsername) == 0 {
		errs = append(errs, ErrInvalidUsername)
	}
	role := vars["role"]
	if role != "voter" && role != "spectator" {
		errs = append(errs, ErrInvalidRole)
	}
	if len(errs) > 0 {
		return "", "", "", errors.Join(errs...)
	}
	return roomId, username, role, nil
}
