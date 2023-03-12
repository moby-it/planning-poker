package handlers

import (
	"log"
	"net/http"

	"github.com/George-Spanos/poker-planning/business/room"
	"github.com/George-Spanos/poker-planning/business/user"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

func CreateRoom(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	room := room.New()
	w.Write([]byte(room.Id))
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func ConnectToRoom(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	roomId, ok := vars["roomId"]
	if !ok {
		log.Println("missing room id from request")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	username, ok := vars["username"]
	if !ok {
		log.Println("missing username from request")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	role, ok := vars["role"]
	if !ok {
		log.Println("missing role from request")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if role != "voter" && role != "spectator" {
		log.Println("invalid role")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	room, roomExists := room.Get(roomId)
	if roomExists {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println("error upgrading connection to websocket", err.Error())
			w.Write([]byte(err.Error()))
			return
		}
		client := user.Connection{User: user.User{Username: username, IsVoter: role == "voter"}, Conn: conn}
		room.AddClient(&client, role)
	} else {
		log.Println("room does not exist")
		w.WriteHeader(http.StatusNotFound)
	}
}
