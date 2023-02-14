// A room represents the place in which many users gather to plan a set of tasks/stories
package web

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
)

var Rooms = make(map[string]*Room)

func init() {
	// create a room for testing
	roomId := "b63fe33a-fc3a-4cb9-9307-c8bcbc23156f"
	room := Room{Id: roomId, Voters: make([]*Client, 0), Spectators: make([]*Client, 0), Round: nil, broadcast: make(chan []byte)}
	round := NewRound(&room)
	room.Round = round
	Rooms[roomId] = &room
	go func() {
		for p := range room.broadcast {
			for _, client := range append(room.Voters, room.Spectators...) {
				client.Connection.WriteJSON(string(p))
			}
		}
	}()
}

type Room struct {
	Id         string
	Voters     []*Client
	Spectators []*Client
	Round      *Round
	broadcast  chan []byte
}

func newRoom() *Room {
	roomId := uuid.New().String()
	room := Room{Id: roomId, Voters: make([]*Client, 0), Spectators: make([]*Client, 0), Round: nil, broadcast: make(chan []byte)}
	round := NewRound(&room)
	room.Round = round
	Rooms[roomId] = &room
	go func() {
		for p := range room.broadcast {
			for _, client := range append(room.Voters, room.Spectators...) {
				client.Connection.WriteJSON(p)
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
func (r Room) notifyUsers() error {
	var err error
	for _, client := range r.Voters {
		err = client.Connection.WriteJSON(r.Round.Votes)
		if err != nil {
			return err
		}
	}
	for _, client := range r.Spectators {

		err = client.Connection.WriteJSON(r.Round.Votes)
		if err != nil {
			return err
		}
	}
	return nil
}

// a client can either connect as a "voter" or a "spectator". Any other role will result in panic
func AddClientToRoom(client *Client, role string) error {
	room := Rooms[client.RoomId]
	switch role {
	case "voter":
		room.Voters = append(room.Voters, client)
	case "spectator":
		room.Spectators = append(room.Spectators, client)
	default:
		panic("incorrect role flag. Please send 'spectator' or 'voter'")
	}
	// get usernames out of room spectators and voters
	usernames := make([]string, 0)
	for _, client := range append(room.Voters, room.Spectators...) {
		usernames = append(usernames, client.Username)
	}
	payload, err := json.Marshal(usernames)
	if err != nil {
		return err
	}
	room.broadcast <- payload
	return nil
}

func (room *Room) RemoveClientFromRoom(client *Client) {
	for i, c := range room.Voters {
		if c == client {
			room.Voters = append(room.Voters[:i], room.Voters[i+1:]...)
		}
	}
	for i, c := range room.Spectators {
		if c == client {
			room.Spectators = append(room.Spectators[:i], room.Spectators[i+1:]...)
		}
	}
	room.emitUsers()
}

func (room *Room) emitUsers() {
	usernames := make([]string, 0)
	for _, client := range append(room.Voters, room.Spectators...) {
		usernames = append(usernames, client.Username)
	}
	payload, err := json.Marshal(usernames)
	if err != nil {
		return
	}
	room.broadcast <- payload
}
func CreateRoom(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	room := newRoom()
	w.Write([]byte(room.Id))
}
