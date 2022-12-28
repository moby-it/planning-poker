package core

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func Connect(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	roomId, ok := vars["roodId"]
	if !ok {
		log.Println("missing room id from request")
		w.WriteHeader(http.StatusBadRequest)
	}
	username, ok := vars["roodId"]
	if !ok {
		log.Println("missing username from request")
		w.WriteHeader(http.StatusBadRequest)
	}
	if RoomExists(roomId) {
		conn, err := upgrader.Upgrade(w, r, nil)
		socketId := r.Header.Get("Sec-WebSocket-Key")
		client := Client{roomId: roomId, username: username, connection: conn}
		Clients[socketId] = &client
		ConnectToRoom(&client, "voter")
		if err != nil {
			log.Println(err)
			return
		}
	}
}
func readMessage(username string, conn *websocket.Conn) {
	defer func() {
		conn.Close()
		// delete(Clients,)
	}()
	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Printf("error: %v", err)
			break
		}
		var vote Vote
		err = json.Unmarshal(message, &vote)
		if err != nil {
			VoteRoom(vote.RoundId, username, vote.StoryPoints)
			continue
		}
		// var revealRound
		err = json.Unmarshal(message, &vote)

	}
}
func writeMessage(message []byte, conn *websocket.Conn) {

}
