// A room represents the place in which many users gather to plan a set of tasks/stories
package web

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/google/uuid"
)

var Rooms = make(map[string]*Room)

// func init() {
// 	// create a room for testing
// 	roomId := "b63fe33a-fc3a-4cb9-9307-c8bcbc23156f"
// 	room := Room{Id: roomId, Voters: make([]*Client, 0), Spectators: make([]*Client, 0), Round: nil, broadcast: make(chan []byte)}
// 	round := NewRound(&room)
// 	room.Round = round
// 	Rooms[roomId] = &room
// 	go func() {
// 		for p := range room.broadcast {
// 			for _, client := range append(room.Voters, room.Spectators...) {
// 				client.Connection.WriteMessage(1, p)
// 			}
// 		}
// 	}()
// }

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
				client.Connection.WriteMessage(1, p)
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
	payload, err := json.Marshal(UserVotedEvent{Username: username})
	if err != nil {
		log.Println(err)
	}
	room.Round.isRevealable()
	room.broadcast <- payload
}
func RoomExists(roomId string) bool {
	_, ok := Rooms[roomId]
	return ok
}

// a client can either connect as a "voter" or a "spectator". Any other role will result in panic
func (room *Room) AddClient(client *Client, role string) error {
	switch role {
	case "voter":
		room.Voters = append(room.Voters, client)
	case "spectator":
		room.Spectators = append(room.Spectators, client)
	default:
		panic("incorrect role flag. Please send 'spectator' or 'voter'")
	}
	room.emitUsers()
	go room.readMessage(client)
	return nil
}

func (room *Room) RemoveClient(client *Client) {
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
	users := make([]User, 0)
	for _, client := range room.Voters {
		users = append(users, User{Username: client.Username, IsVoter: true})
	}
	for _, client := range room.Spectators {
		users = append(users, User{Username: client.Username, IsVoter: false})
	}
	payload, err := json.Marshal(UsersUpdatedEvent{Users: users})
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
func (room *Room) readMessage(client *Client) {
	defer func() {
		client.Connection.Close()
		delete(Clients, client.Id)
	}()
	for {
		_, message, err := client.Connection.ReadMessage()
		if err != nil {
			log.Printf("error: %v", err)
			room.RemoveClient(client)
			break
		}
		storyPoints, err := strconv.Atoi(string(message))
		if err == nil {
			Vote(client.RoomId, client.Username, storyPoints)
			continue
		}

	}
}
