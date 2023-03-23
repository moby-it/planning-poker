// A room represents the place in which many users gather to plan a set of tasks/stories
package room

import (
	"context"
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/George-Spanos/poker-planning/business/actions"
	"github.com/George-Spanos/poker-planning/business/events"
	"github.com/George-Spanos/poker-planning/business/user"
	"github.com/google/uuid"
)

const (

	// Time allowed to read the next pong message from the peer.
	pongWait = 15 * time.Second

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

type Room struct {
	Id           string
	Voters       []*user.Connection
	Spectators   []*user.Connection
	CurrentRound *Round
	cancelReveal chan bool
	Mu           sync.RWMutex
}

var rooms = make(map[string]*Room)

func (room *Room) convertSpectatorToVoter(username string) {
	for i, spectator := range room.Spectators {
		if spectator.Username == username {
			room.Spectators = append(room.Spectators[:i], room.Spectators[i+1:]...)
			room.Voters = append(room.Voters, spectator)
			break
		}
	}
}
func (room *Room) convertVoterToSpectator(username string) {
	for i, voter := range room.Voters {
		if voter.Username == username {
			room.Voters = append(room.Voters[:i], room.Voters[i+1:]...)
			room.Spectators = append(room.Spectators, voter)
			delete(room.CurrentRound.Votes, voter.Username)
			break
		}
	}
}
func Get(roomId string) (*Room, bool) {
	room, found := rooms[roomId]
	return room, found
}
func GetLength() int {
	return len(rooms)
}
func (room *Room) UserHasVoted(username string) bool {
	room.Mu.RLock()
	_, found := room.CurrentRound.Votes[username]
	room.Mu.RUnlock()
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
func (room *Room) ConvertUserRole(username string, role string) {
	if role == "voter" {
		room.convertSpectatorToVoter(username)
	} else {
		room.convertVoterToSpectator(username)
	}
	room.emitUsersAndRevealableRound()
}
func (room *Room) Connections() []*user.Connection {
	return append(room.Voters, room.Spectators...)
}
func (room *Room) IsEmpty() bool {
	return len(room.Voters) == 0 && len(room.Spectators) == 0
}

func (r *Room) Close() {
	r.Mu.RLock()
	defer r.Mu.RUnlock()
	delete(rooms, r.Id)
}
func (room *Room) Vote(username string, storyPoints int) {
	room.Mu.RLock()
	room.CurrentRound.Votes[username] = storyPoints
	room.Mu.RUnlock()
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
	room.emitUsersAndRevealableRound()

	go room.readMessage(client)
	log.Printf("%v joined room %v", client.Username, room.Id)
	return nil
}

func (room *Room) removeClient(client *user.Connection) {
	room.Mu.RLock()
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
	room.Mu.RUnlock()
	room.emitUsersAndRevealableRound()
	log.Printf("%v left room %v", client.Username, room.Id)
}
func (room *Room) RevealCurrentRound() {
	if !room.CurrentRound.IsRevealable(len(room.Voters)) {
		log.Println("Cannot reveal round. Not enough votes. RoundId: ", room.Id)
		return
	}
	event := events.RoundRevealedEvent{Event: events.Event{Type: events.RoundRevealed}, Votes: room.CurrentRound.Votes}
	room.CurrentRound.Revealed = true
	events.Broadcast(event, room.Connections()...)
}
func (room *Room) emitUsersAndRevealableRound() {
	users := make([]user.User, 0)
	for _, client := range room.Voters {
		users = append(users, user.User{Username: client.Username, IsVoter: true, HasVoted: room.UserHasVoted(client.Username)})
	}
	for _, client := range room.Spectators {
		users = append(users, user.User{Username: client.Username, IsVoter: false})
	}
	event := events.UsersUpdatedEvent{Users: users, Event: events.Event{Type: events.UsersUpdated}}
	events.Broadcast(event, room.Connections()...)
	room.Mu.RLock()
	if !room.CurrentRound.Revealed {
		revealableEvent := events.RoundRevealAvailableEvent{Event: events.Event{Type: events.RoundRevealAvailable}, RevealAvailable: room.CurrentRound.IsRevealable(len(room.Voters))}
		room.Mu.RUnlock()
		if room.cancelReveal != nil {
			room.cancelReveal <- true
		}
		events.Broadcast(revealableEvent, room.Connections()...)
	}
}

func (room *Room) readMessage(client *user.Connection) {
	defer client.Close()
	client.SetReadLimit(maxMessageSize)
	client.SetReadDeadline(time.Now().Add(pongWait))
	for {
		_, message, err := client.ReadMessage()
		if err != nil {
			log.Printf("error: %v \nclient: %v", err, client.Username)
			if client.IsVoter && room.cancelReveal != nil {
				room.cancelReveal <- true
			}
			room.removeClient(client)
			if room.IsEmpty() {
				log.Printf("Room %s is empty. Closing room", room.Id)
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
		case actions.Ping:
			client.SetReadDeadline(time.Now().Add(pongWait))
			client.WriteJSON(events.PongEvent{Event: events.Event{Type: events.Pong}})
		case actions.UserToVote:
			var action actions.UserToVoteAction
			err = json.Unmarshal(message, &action)
			if err != nil {
				log.Println("Error parsing user vote:", err)
				continue
			}
			room.Vote(client.Username, action.StoryPoints)
		case actions.RoundToReveal:
			event := events.RoundToRevealEvent{Event: events.Event{Type: events.RoundToReveal}, After: 5000} // after in ms
			events.Broadcast(event, room.Connections()...)
			reveal, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			room.Mu.RLock()
			room.cancelReveal = make(chan bool, 1)
			room.Mu.RUnlock()
			go func() {
				select {
				case <-room.cancelReveal:
					log.Println("Cancel reveal")
					event := events.CancelRevealEvent{Event: events.Event{Type: events.CancelReveal}}
					events.Broadcast(event, room.Connections()...)
					cancel()
				case <-reveal.Done():
					room.RevealCurrentRound()
				}
				room.Mu.RLock()
				room.cancelReveal = nil
				room.Mu.RUnlock()
			}()
		case actions.CancelReveal:
			room.cancelReveal <- true
		case actions.RoundToStart:
			room.CurrentRound = NewRound()
			event := events.RoundStartedEvent{Event: events.Event{Type: events.RoundStarted}}
			events.Broadcast(event, room.Connections()...)
		case actions.ChangeRole:
			var action actions.ChangeRoleAction
			err = json.Unmarshal(message, &action)
			if err != nil {
				log.Println("Error parsing user vote:", err)
				continue
			}
			room.ConvertUserRole(client.Username, action.Role)
		}
	}
}
