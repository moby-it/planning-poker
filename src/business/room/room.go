// A room represents the place in which many users gather to plan a set of tasks/stories
package room

import (
	"log"
	"sync"

	"github.com/George-Spanos/poker-planning/business/user"
	"github.com/google/uuid"
)

type Room struct {
	Id           string
	Voters       []*user.Connection
	Spectators   []*user.Connection
	CurrentRound *Round
	CancelReveal chan bool
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
	if !room.CurrentRound.Revealed {
		room.Mu.RLock()
		room.CurrentRound.Votes[username] = storyPoints
		room.Mu.RUnlock()
	}
}
func (room *Room) RemoveClient(client *user.Connection) {
	room.Mu.RLock()
	for i, c := range room.Voters {
		if c == client {
			room.Voters = append(room.Voters[:i], room.Voters[i+1:]...)
			if !room.CurrentRound.Revealed {
				delete(room.CurrentRound.Votes, c.Username)
			}
		}
	}
	for i, c := range room.Spectators {
		if c == client {
			room.Spectators = append(room.Spectators[:i], room.Spectators[i+1:]...)
		}
	}
	room.Mu.RUnlock()

	log.Printf("%v left room %v", client.Username, room.Id)
}
