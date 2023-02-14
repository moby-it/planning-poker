package web

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

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
	if RoomExists(roomId) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			w.Write([]byte(err.Error()))
			return
		}
		socketId := r.Header.Get("Sec-WebSocket-Key")
		client := Client{RoomId: roomId, Username: username, Connection: conn, Id: socketId}
		Clients[socketId] = &client
		AddClientToRoom(&client, "voter")
		go readMessage(&client)
	} else {
		w.WriteHeader(http.StatusNotFound)
	}
}
func readMessage(client *Client) {
	defer func() {
		client.Connection.Close()
		delete(Clients, client.Id)
	}()
	for {
		_, message, err := client.Connection.ReadMessage()
		if err != nil {
			log.Printf("error: %v", err)
			break
		}
		storyPoints, err := strconv.Atoi(string(message))
		if err == nil {
			Vote(client.RoomId, client.Username, storyPoints)
			continue
		}

	}
}

// func writeMessage(message []byte, conn *websocket.Conn) {
//
// }
