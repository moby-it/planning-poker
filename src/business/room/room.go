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
	Voters       []user.User
	Spectators   []user.User
	CurrentRound *Round
	CancelReveal chan bool
	mu           sync.Mutex
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
	room.mu.Lock()
	_, found := room.CurrentRound.Votes[username]
	room.mu.Unlock()
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
	room := Room{Id: roomId, Voters: make([]user.User, 0), Spectators: make([]user.User, 0), CurrentRound: nil}
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
func (room *Room) IsEmpty() bool {
	return len(room.Voters) == 0 && len(room.Spectators) == 0
}

func (r *Room) Close() {
	r.mu.Lock()
	defer r.mu.Unlock()
	delete(rooms, r.Id)
}
func (room *Room) Vote(username string, storyPoints int) {
	if !room.CurrentRound.Revealed {
		room.mu.Lock()
		room.CurrentRound.Votes[username] = storyPoints
		room.mu.Unlock()
	}
}
func (room *Room) AddUser(u user.User) {
	if u.IsVoter {
		room.Voters = append(room.Voters, u)
	} else {
		room.Spectators = append(room.Spectators, u)
	}
}
func (room *Room) RemoveUser(u user.User) {
	room.mu.Lock()
	for i, c := range room.Voters {
		if c.Username == u.Username {
			room.Voters = append(room.Voters[:i], room.Voters[i+1:]...)
			if !room.CurrentRound.Revealed {
				delete(room.CurrentRound.Votes, c.Username)
			}
		}
	}
	for i, c := range room.Spectators {
		if c.Username == u.Username {
			room.Spectators = append(room.Spectators[:i], room.Spectators[i+1:]...)
		}
	}
	room.mu.Unlock()

	log.Printf("%v left room %v", u.Username, room.Id)
}
func (r *Room) CreateCancelRevealChan() {
	r.mu.Lock()
	r.CancelReveal = make(chan bool, 1)
	r.mu.Unlock()
}
func (r *Room) ResetCancelReveal() {
	r.mu.Lock()
	r.CancelReveal = nil
	r.mu.Unlock()
}
