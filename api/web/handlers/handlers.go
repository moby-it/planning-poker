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
	room, roomExists := room.Get(roomId)
	if roomExists {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			w.Write([]byte(err.Error()))
			return
		}
		client := user.Connection{User: user.User{Username: username, IsVoter: true}, Conn: conn}
		room.AddClient(&client, "voter")
	} else {
		log.Println("room does not exist")
		w.WriteHeader(http.StatusNotFound)
	}
}
