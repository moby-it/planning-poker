// A room represents the place in which many users gather to plan a set of tasks/stories
// This implementation uses sync.Map for thread-safe concurrent access to rooms and users
package room

import (
	"context"
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/George-Spanos/poker-planning/business/actions"
	"github.com/George-Spanos/poker-planning/business/events"
	"github.com/George-Spanos/poker-planning/business/scales"
	"github.com/George-Spanos/poker-planning/business/stats"
	"github.com/George-Spanos/poker-planning/business/user"
	"github.com/google/uuid"
)

const (
	pongWait       = 5 * time.Minute
	maxMessageSize = 512
	DefaultScale   = "fibonacci"
)

// IsValidScale reports whether scale is a known scale identifier.
func IsValidScale(scale string) bool {
	return scales.IsValid(scale)
}

type Room struct {
	Id           string
	Scale        string
	Voters       sync.Map // username -> *user.Connection
	Spectators   sync.Map // username -> *user.Connection
	CurrentRound *Round
	cancelReveal chan bool
	cancelMu     sync.RWMutex // Just for cancelReveal channel
}

// Using sync.Map for thread-safe global rooms storage
var rooms sync.Map

// GetVoterCount returns the number of voters in the room
func (room *Room) GetVoterCount() int {
	count := 0
	room.Voters.Range(func(key, value interface{}) bool {
		count++
		return true
	})
	return count
}

func (room *Room) convertSpectatorToVoter(username string) {
	if value, loaded := room.Spectators.LoadAndDelete(username); loaded {
		spectator := value.(*user.Connection)
		room.Voters.Store(username, spectator)
	}
}

func (room *Room) convertVoterToSpectator(username string) {
	if value, loaded := room.Voters.LoadAndDelete(username); loaded {
		voter := value.(*user.Connection)
		room.Spectators.Store(username, voter)

		room.CurrentRound.Votes.Delete(voter.Username)
	}
}

func Get(roomId string) (*Room, bool) {
	value, found := rooms.Load(roomId)
	if !found {
		return nil, false
	}
	return value.(*Room), true
}

func GetLength() int {
	count := 0
	rooms.Range(func(key, value interface{}) bool {
		count++
		return true
	})
	return count
}

func (room *Room) UserHasVoted(username string) bool {
	_, found := room.CurrentRound.Votes.Load(username)
	return found
}

func (room *Room) IncludeUsername(username string) bool {
	if _, ok := room.Voters.Load(username); ok {
		return true
	}
	if _, ok := room.Spectators.Load(username); ok {
		return true
	}
	return false
}

func New(scale string) *Room {
	roomId := uuid.New().String()
	room := Room{
		Id:           roomId,
		Scale:        scale,
		Voters:       sync.Map{},
		Spectators:   sync.Map{},
		CurrentRound: nil,
	}
	round := NewRound()
	room.CurrentRound = round
	rooms.Store(roomId, &room)
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
	connections := make([]*user.Connection, 0)

	// Collect all voters
	room.Voters.Range(func(key, value interface{}) bool {
		connections = append(connections, value.(*user.Connection))
		return true
	})

	// Collect all spectators
	room.Spectators.Range(func(key, value interface{}) bool {
		connections = append(connections, value.(*user.Connection))
		return true
	})

	return connections
}

func (room *Room) IsEmpty() bool {
	votersEmpty := true
	spectatorsEmpty := true

	room.Voters.Range(func(key, value interface{}) bool {
		votersEmpty = false
		return false // Stop iteration
	})

	if votersEmpty {
		room.Spectators.Range(func(key, value interface{}) bool {
			spectatorsEmpty = false
			return false // Stop iteration
		})
	}

	return votersEmpty && spectatorsEmpty
}

func (r *Room) Close() {
	rooms.Delete(r.Id)
}

func (room *Room) Vote(username string, storyPoints int) {
	if !room.CurrentRound.IsRevealed() {
		room.CurrentRound.Votes.Store(username, storyPoints)
		voterCount := room.GetVoterCount()
		revealable := room.CurrentRound.IsRevealable(voterCount)

		connections := room.Connections()
		event := events.UserVotedEvent{Username: username, Event: events.Event{Type: events.UserVoted}}
		events.Broadcast(event, connections...)
		revealEvent := events.RoundRevealAvailableEvent{Event: events.Event{Type: events.RoundRevealAvailable}, RevealAvailable: revealable}
		events.Broadcast(revealEvent, connections...)
	}
}

func (room *Room) AddClient(client *user.Connection, role string) error {
	switch role {
	case "voter":
		room.Voters.Store(client.Username, client)
	case "spectator":
		room.Spectators.Store(client.Username, client)
	}

	room.emitUsersAndRevealableRound()
	go room.readMessage(client)
	log.Printf("%v joined room %v", client.Username, room.Id)
	return nil
}

func (room *Room) removeClient(client *user.Connection) {
	// Try to remove from voters
	if _, loaded := room.Voters.LoadAndDelete(client.Username); loaded {
		if !room.CurrentRound.IsRevealed() {
			room.CurrentRound.Votes.Delete(client.Username)
			room.emitUsersAndRevealableRound()
		}
	} else {
		// Try to remove from spectators
		room.Spectators.Delete(client.Username)
	}

	log.Printf("%v left room %v", client.Username, room.Id)
}

func (room *Room) RevealCurrentRound() {
	voterCount := room.GetVoterCount()
	if !room.CurrentRound.IsRevealable(voterCount) {
		log.Println("Cannot reveal round. Not enough votes. RoomId: ", room.Id)
		return
	}

	room.CurrentRound.SetRevealed(true)
	votes := room.CurrentRound.GetVotesMap()

	connections := room.Connections()
	event := events.RoundRevealedEvent{
		Event: events.Event{Type: events.RoundRevealed},
		Votes: votes,
		Stats: stats.Compute(votes, scales.Get(room.Scale)),
	}
	events.Broadcast(event, connections...)
}

func (room *Room) emitUsersAndRevealableRound() {
	users := make([]user.User, 0)

	// Collect voters
	room.Voters.Range(func(key, value interface{}) bool {
		client := value.(*user.Connection)
		hasVoted := room.UserHasVoted(client.Username)
		users = append(users, user.User{Username: client.Username, IsVoter: true, HasVoted: hasVoted})
		return true
	})

	// Collect spectators
	room.Spectators.Range(func(key, value interface{}) bool {
		client := value.(*user.Connection)
		users = append(users, user.User{Username: client.Username, IsVoter: false})
		return true
	})

	revealed := room.CurrentRound.IsRevealed()
	voterCount := room.GetVoterCount()
	revealable := room.CurrentRound.IsRevealable(voterCount)

	room.cancelMu.RLock()
	cancelChan := room.cancelReveal
	room.cancelMu.RUnlock()

	connections := room.Connections()
	event := events.UsersUpdatedEvent{Users: users, Event: events.Event{Type: events.UsersUpdated}, Scale: room.Scale}
	events.Broadcast(event, connections...)

	if !revealed {
		revealableEvent := events.RoundRevealAvailableEvent{Event: events.Event{Type: events.RoundRevealAvailable}, RevealAvailable: revealable}
		if cancelChan != nil {
			select {
			case cancelChan <- true:
			default:
			}
		}
		events.Broadcast(revealableEvent, connections...)
	} else {
		room.RevealCurrentRound()
	}
}

func (room *Room) readMessage(client *user.Connection) {
	defer client.Close()
	client.SetReadLimit(maxMessageSize)
	client.SetReadDeadline(time.Now().Add(pongWait))

	for {
		_, message, err := client.ReadMessage()
		if err != nil {
			log.Printf("Client %v: error: %v", client.Username, err)

			room.cancelMu.RLock()
			cancelChan := room.cancelReveal
			room.cancelMu.RUnlock()

			_, isVoter := room.Voters.Load(client.Username)

			if isVoter && cancelChan != nil {
				select {
				case cancelChan <- true:
				default:
				}
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
			log.Printf("%v refreshed connection deadline", client.Username)
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
			connections := room.Connections()
			event := events.RoundToRevealEvent{Event: events.Event{Type: events.RoundToReveal}, After: 5000}
			events.Broadcast(event, connections...)
			reveal, cancel := context.WithTimeout(context.Background(), 5*time.Second)

			room.cancelMu.Lock()
			room.cancelReveal = make(chan bool, 1)
			room.cancelMu.Unlock()

			go room.waitForCancelReveal(reveal, cancel)

		case actions.CancelReveal:
			room.cancelMu.RLock()
			cancelChan := room.cancelReveal
			room.cancelMu.RUnlock()

			if cancelChan != nil {
				select {
				case cancelChan <- true:
				default:
				}
			}

		case actions.RoundToStart:
			room.CurrentRound = NewRound()

			connections := room.Connections()
			event := events.RoundStartedEvent{Event: events.Event{Type: events.RoundStarted}}
			events.Broadcast(event, connections...)
			room.emitUsersAndRevealableRound()

		case actions.ChangeRole:
			var action actions.ChangeRoleAction
			err = json.Unmarshal(message, &action)
			if err != nil {
				log.Println("Error parsing change role:", err)
				continue
			}
			room.ConvertUserRole(client.Username, action.Role)
		}
	}
}

func (room *Room) waitForCancelReveal(reveal context.Context, cancel context.CancelFunc) {
	room.cancelMu.RLock()
	cancelChan := room.cancelReveal
	room.cancelMu.RUnlock()

	select {
	case <-cancelChan:
		log.Println("Cancel reveal")
		connections := room.Connections()
		event := events.CancelRevealEvent{Event: events.Event{Type: events.CancelReveal}}
		events.Broadcast(event, connections...)
		cancel()

	case <-reveal.Done():
		room.RevealCurrentRound()
	}

	room.cancelMu.Lock()
	room.cancelReveal = nil
	room.cancelMu.Unlock()
}
