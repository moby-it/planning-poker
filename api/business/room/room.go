// A room represents the place in which many users gather to plan a set of tasks/stories
package room

import (
	"encoding/json"
	"log"

	"github.com/George-Spanos/poker-planning/business/user"
	"github.com/google/uuid"
)

var rooms = make(map[string]*Room)

type Room struct {
	Id           string
	Voters       []*user.Connection
	Spectators   []*user.Connection
	CurrentRound *Round
	broadcast    chan []byte
}

func (r Room) Broadcast(message []byte) {
	r.broadcast <- message
}

func New() *Room {
	roomId := uuid.New().String()
	room := Room{Id: roomId, Voters: make([]*user.Connection, 0), Spectators: make([]*user.Connection, 0), CurrentRound: nil, broadcast: make(chan []byte)}
	round := NewRound()
	room.CurrentRound = round
	rooms[roomId] = &room
	go func() {
		for p := range room.broadcast {
			for _, connection := range append(room.Voters, room.Spectators...) {
				connection.WriteMessage(1, p)
			}
		}
	}()
	return &room
}

func Get(roomId string) (*Room, bool) {
	room, found := rooms[roomId]
	return room, found
}
func GetLength() int {
	return len(rooms)
}
func (r Room) Close() {
	close(r.broadcast)
	delete(rooms, r.Id)
}
func (room *Room) vote(username string, storyPoints int) {
	room.CurrentRound.Votes[username] = storyPoints
	payload, err := json.Marshal(user.UserVotedEvent{Username: username, Event: user.Event{Type: user.UserVoted}})
	if err != nil {
		log.Println(err)
	}
	room.broadcast <- payload
	if room.CurrentRound.IsRevealable(len(room.Voters)) {
		payload, err := json.Marshal(user.RoundRevealAvailableEvent{Event: user.Event{Type: user.RoundRevealAvailable}, RevealAvailable: true})
		if err != nil {
			log.Println(err)
		}
		room.broadcast <- payload
	}
}

// a client can either connect as a "voter" or a "spectator". Any other role will result in panic
func (room *Room) AddClient(client *user.Connection, role string) error {
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

func (room *Room) removeClient(client *user.Connection) {
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
	users := make([]user.User, 0)
	for _, client := range room.Voters {
		users = append(users, user.User{Username: client.Username, IsVoter: true})
	}
	for _, client := range room.Spectators {
		users = append(users, user.User{Username: client.Username, IsVoter: false})
	}
	payload, err := json.Marshal(user.UsersUpdatedEvent{Users: users, Event: user.Event{Type: user.UsersUpdated}})
	if err != nil {
		return
	}
	room.broadcast <- payload
}

func (room *Room) readMessage(client *user.Connection) {
	defer func() {
		client.Close()
	}()
	for {
		_, message, err := client.ReadMessage()
		if err != nil {
			log.Printf("error: %v", err)
			room.removeClient(client)
			break
		}
		// should broadcast message if it fits any user event type
		var event user.Event
		err = json.Unmarshal(message, &event)
		if err != nil {
			log.Println(err)
			continue
		}
		switch event.Type {
		case user.UserVoted:
			var userVotedEvent user.UserVotedEvent
			err = json.Unmarshal(message, &userVotedEvent)
			if err != nil {
				log.Println(err)
				continue
			}
			room.vote(userVotedEvent.Username, userVotedEvent.StoryPoints)
		case user.RoundRevealed:
			var roundRevealedEvent user.RoundRevealedEvent
			err = json.Unmarshal(message, &roundRevealedEvent)
			if err != nil {
				log.Println(err)
				continue
			}
			votes := make(map[string]int)
			for _, voter := range room.Voters {
				votes[voter.Username] = room.CurrentRound.Votes[voter.Username]
			}
			payload, err := json.Marshal(user.RoundRevealedEvent{Votes: votes, Event: user.Event{Type: user.RoundRevealed}})
			if err != nil {
				log.Println(err)
			}
			room.broadcast <- payload
		}

	}
}
