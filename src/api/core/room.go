// A room represents the place in which many users gather to plan a set of tasks/stories
package core

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/google/uuid"
)

var Rooms = make(map[string]*Room)

type Room struct {
	Id         string
	Voters     []*Client
	Spectators []*Client
	Round      *Round
	broadcast  chan []byte
}

func NewRoom() *Room {
	roomId := uuid.New().String()
	round := NewRound()
	room := Room{Id: roomId, Voters: make([]*Client, 0), Spectators: make([]*Client, 0), Round: round, broadcast: make(chan []byte)}
	round.Room = &room
	Rooms[roomId] = &room
	go func() {
		for p := range room.broadcast {
			for _, client := range append(room.Voters, room.Spectators...) {
				client.connection.WriteJSON(p)
			}
		}
	}()
	return &room
}
func (r Room) Close() {
	close(r.broadcast)
	delete(Rooms, r.Id)
}
func Vote(roomId string, username string, storyPoints int) {
	room := Rooms[roomId]
	room.Round.Votes[username] = storyPoints
}
func RoomExists(roomId string) bool {
	_, ok := Rooms[roomId]
	return ok
}
func ConnectToRoom(client *Client, role string) error {
	room := Rooms[client.roomId]
	switch role {
	case "voter":
		room.Voters = append(room.Voters, client)
	case "spectator":
		room.Spectators = append(room.Spectators, client)
	default:
		return fmt.Errorf("incorrect role flag. Please send 'spectator' or 'voter'")
	}
	payload, err := json.Marshal(UserConnectedEvent{Username: client.username, Voter: role == "voter"})
	if err != nil {
		return err
	}
	room.broadcast <- payload
	return nil
}
func CreateRoom(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	room := NewRoom()
	w.Write([]byte(room.Id))
}
