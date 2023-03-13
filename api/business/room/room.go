// A room represents the place in which many users gather to plan a set of tasks/stories
package room

import (
	"encoding/json"
	"log"

	"github.com/George-Spanos/poker-planning/business/actions"
	"github.com/George-Spanos/poker-planning/business/events"
	"github.com/George-Spanos/poker-planning/business/user"
	"github.com/google/uuid"
)

type Room struct {
	Id           string
	Voters       []*user.Connection
	Spectators   []*user.Connection
	CurrentRound *Round
}

var rooms = make(map[string]*Room)

func Get(roomId string) (*Room, bool) {
	room, found := rooms[roomId]
	return room, found
}
func GetLength() int {
	return len(rooms)
}
func (room *Room) UserHasVoted(username string) bool {
	_, found := room.CurrentRound.Votes[username]
	return found
}
func (room *Room) IncludeUsername(username string) bool {
	for _, voter := range room.Voters {
		if voter.Username == username {
			return true
		}
	}
	for _, spectator := range room.Spectators {
		if spectator.Username == username {
			return true
		}
	}
	return false
}
func New() *Room {
	roomId := uuid.New().String()
	room := Room{Id: roomId, Voters: make([]*user.Connection, 0), Spectators: make([]*user.Connection, 0), CurrentRound: nil}
	round := NewRound()
	room.CurrentRound = round
	rooms[roomId] = &room
	return &room
}

func (room *Room) Connections() []*user.Connection {
	return append(room.Voters, room.Spectators...)
}
func (room *Room) IsEmpty() bool {
	return len(room.Voters) == 0 && len(room.Spectators) == 0
}

func (r Room) Close() {
	delete(rooms, r.Id)
}
func (room *Room) Vote(username string, storyPoints int) {
	room.CurrentRound.Votes[username] = storyPoints
	event := events.UserVotedEvent{Username: username, Event: events.Event{Type: events.UserVoted}}
	events.Broadcast(event, room.Connections()...)
	revealEvent := events.RoundRevealAvailableEvent{Event: events.Event{Type: events.RoundRevealAvailable}, RevealAvailable: room.CurrentRound.IsRevealable(len(room.Voters))}
	events.Broadcast(revealEvent, room.Connections()...)
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
	event := events.RoundRevealAvailableEvent{Event: events.Event{Type: events.RoundRevealAvailable}, RevealAvailable: room.CurrentRound.IsRevealable(len(room.Voters))}
	events.Broadcast(event, room.Connections()...)
	go room.readMessage(client)
	return nil
}

func (room *Room) removeClient(client *user.Connection) {
	for i, c := range room.Voters {
		if c == client {
			room.Voters = append(room.Voters[:i], room.Voters[i+1:]...)
			delete(room.CurrentRound.Votes, c.Username)
		}
	}
	for i, c := range room.Spectators {
		if c == client {
			room.Spectators = append(room.Spectators[:i], room.Spectators[i+1:]...)
		}
	}
	room.emitUsers()
	event := events.RoundRevealAvailableEvent{Event: events.Event{Type: events.RoundRevealAvailable}, RevealAvailable: room.CurrentRound.IsRevealable(len(room.Voters))}
	events.Broadcast(event, room.Connections()...)
}
func (room *Room) RevealCurrentRound() {
	if !room.CurrentRound.IsRevealable(len(room.Voters)) {
		log.Println("Cannot reveal round. Not enough votes")
		return
	}
	event := events.RoundRevealedEvent{Event: events.Event{Type: events.RoundRevealed}, Votes: room.CurrentRound.Votes}
	events.Broadcast(event, room.Connections()...)
}
func (room *Room) emitUsers() {
	users := make([]user.User, 0)
	for _, client := range room.Voters {
		users = append(users, user.User{Username: client.Username, IsVoter: true, HasVoted: room.UserHasVoted(client.Username)})
	}
	for _, client := range room.Spectators {
		users = append(users, user.User{Username: client.Username, IsVoter: false})
	}
	event := events.UsersUpdatedEvent{Users: users, Event: events.Event{Type: events.UsersUpdated}}
	events.Broadcast(event, room.Connections()...)
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
			if room.IsEmpty() {
				room.Close()
			}
			break
		}
		var a actions.Action
		err = json.Unmarshal(message, &a)
		if err != nil {
			log.Println(err)
			continue
		}
		switch a.Type {
		case actions.UserToVote:
			var action actions.UserToVoteAction
			err = json.Unmarshal(message, &action)
			if err != nil {
				log.Println("Error parsing user vote:", err)
				continue
			}
			room.Vote(client.Username, action.StoryPoints)
		case actions.RoundToReveal:
			room.RevealCurrentRound()
		case actions.RoundToStart:
			room.CurrentRound = NewRound()
			event := events.RoundStartedEvent{Event: events.Event{Type: events.RoundStarted}}
			events.Broadcast(event, room.Connections()...)
		}
	}
}
