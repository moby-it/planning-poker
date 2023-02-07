package business

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

func Connect(w http.ResponseWriter, r *http.Request) {
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
		client := Client{roomId: roomId, username: username, connection: conn, id: socketId}
		Clients[socketId] = &client
		ConnectToRoom(&client, "voter")
		go readMessage(&client)
	} else {
		w.WriteHeader(http.StatusNotFound)
	}
}
func readMessage(client *Client) {
	defer func() {
		client.connection.Close()
		delete(Clients, client.id)
	}()
	for {
		_, message, err := client.connection.ReadMessage()
		if err != nil {
			log.Printf("error: %v", err)
			break
		}
		storyPoints, err := strconv.Atoi(string(message))
		if err == nil {
			Vote(client.roomId, client.username, storyPoints)
			continue
		}

	}
}

// func writeMessage(message []byte, conn *websocket.Conn) {
//
// }
