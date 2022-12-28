// A room represents the place in which many users gather to plan a set of tasks/stories
package core

import (
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
}

func NewRoom() *Room {
	roomId := uuid.New().String()
	round := NewRound()
	room := Room{Id: roomId, Voters: make([]*Client, 0), Spectators: make([]*Client, 0), Round: round}
	round.Room = &room
	Rooms[roomId] = &room
	return &room
}
func (r Room) Close() {
	delete(Rooms, r.Id)
}
func VoteRoom(roomId string, username string, storyPoints int) {
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
