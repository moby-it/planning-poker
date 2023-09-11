package handlers

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/George-Spanos/poker-planning/business/room"
	"github.com/George-Spanos/poker-planning/business/user"
	"github.com/George-Spanos/poker-planning/web/websockets"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

var (
	ErrInvalidUsername   = errors.New("invalid username from request")
	ErrInvalidRole       = errors.New("invalid role")
	ErrDuplicateUsername = errors.New("duplicate username in room")
	ErrRoomNotFound      = errors.New("room id not found")
)

func CreateRoom(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	username := r.FormValue("username")
	isSpectator := r.FormValue("isSpectator")
	var role string
	if isSpectator == "" {
		role = "voter"
	} else {
		role = "spectator"
	}
	room := room.New()
	w.Header().Add("HX-Redirect", fmt.Sprintf("/room/%s?username=%s&role=%s", room.Id, username, role))
	w.Write([]byte(room.Id))
}

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
	room, roomExists := room.Get(roomId)
	if roomExists {
		if room.IncludeUsername(username) {
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
		websockets.AddClient(u, conn, room)

	} else {
		log.Println(ErrRoomNotFound.Error())
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte(ErrRoomNotFound.Error()))
	}
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
