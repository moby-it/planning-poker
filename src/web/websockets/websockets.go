package websockets

import (
	"context"
	"encoding/json"
	"log"
	"strconv"
	"sync"
	"time"

	"github.com/George-Spanos/poker-planning/business/room"
	"github.com/George-Spanos/poker-planning/business/user"
	"github.com/George-Spanos/poker-planning/web/websockets/actions"
	"github.com/George-Spanos/poker-planning/web/websockets/events"
	"github.com/gorilla/websocket"
)

type Connection struct {
	*websocket.Conn
	Mu sync.Mutex
}

type Broadcastable interface {
	events.UserVotedEvent | events.RoundRevealedEvent |
		events.RoundRevealAvailableEvent | events.RoundStartedEvent |
		events.UsersUpdatedEvent | events.CancelRevealEvent |
		events.RoundToRevealEvent
}

const (

	// Time allowed to read the next pong message from the peer.
	pongWait = 5 * time.Minute

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

// username-websocket connection map
var clients map[string]*Connection = make(map[string]*Connection)

// a client can either connec*github.com/George-Spanos/poker-planning/business/room.Room {Id: "a180bb40-690d-4838-ad63-4b057a5ffc15", Voters: []github.com/George-Spanos/poker-planning/business/user.User len: 1, cap: 1, [(*"github.com/George-Spanos/poker-planning/business/user.User")(0...t as a "voter" or a "spectator". Any other role will result in panic
func AddClient(u user.User, conn *websocket.Conn, r *room.Room) error {
	r.AddUser(u)
	clients[u.Username] = &Connection{Conn: conn}
	emitUsersAndRevealableRound(r)

	go readMessage(u, r)
	log.Printf("%v joined room %v", u.Username, r.Id)
	return nil
}
func readMessage(u user.User, r *room.Room) {
	conn, found := clients[u.Username]
	if !found {
		log.Fatalln("cannot read message due to failin to find connection")
	}
	defer conn.Close()
	conn.SetReadLimit(maxMessageSize)
	conn.SetReadDeadline(time.Now().Add(pongWait))
	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Printf("Client %v: error: %v", u.Username, err)
			if u.IsVoter && r.CancelReveal != nil {
				r.CancelReveal <- true
			}
			r.RemoveUser(u)
			emitUsersAndRevealableRound(r)
			if r.IsEmpty() {
				log.Printf("Room %s is empty. Closing room", r.Id)
				r.Close()
			}
			break
		}
		var a actions.Action
		err = json.Unmarshal(message, &a)
		if err != nil {
			log.Println(err)
			msg, err := strconv.Atoi(string(message))
			if err != nil {
				continue
			}
			if msg == websocket.PingMessage {
				conn.SetReadDeadline(time.Now().Add(pongWait))
				log.Printf("%v refreshed connection deadline", u.Username)
				conn.WriteMessage(websocket.PongMessage, []byte(strconv.Itoa(websocket.PongMessage)))
				continue
			}
		}
		switch a.Type {
		case actions.UserToVote:
			if r.CancelReveal != nil {
				continue
			}
			var action actions.UserToVoteAction
			err = json.Unmarshal(message, &action)
			if err != nil {
				log.Println("Error parsing user vote:", err)
				continue
			}
			r.Vote(u.Username, action.StoryPoints)
			event := events.UserVotedEvent{Username: u.Username, Event: events.Event{Type: events.UserVoted}}
			Broadcast(event, r)
			revealEvent := events.RoundRevealAvailableEvent{Event: events.Event{Type: events.RoundRevealAvailable}, RevealAvailable: r.CurrentRound.IsRevealable(len(r.Voters))}
			Broadcast(revealEvent, r)
		case actions.RoundToReveal:
			reveal, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			r.CreateCancelRevealChan()
			event := events.RoundToRevealEvent{Event: events.Event{Type: events.RoundToReveal}, After: 5000} // after in ms
			Broadcast(event, r)
			go waitForCancelReveal(r, reveal, cancel)
		case actions.CancelReveal:
			r.CancelReveal <- true
		case actions.RoundToStart:
			r.CurrentRound = room.NewRound()
			// event := events.RoundStartedEvent{Event: events.Event{Type: events.RoundStarted}}
			// Broadcast(event, r)
			emitUsersAndRevealableRound(r)
		case actions.ChangeRole:
			var action actions.ChangeRoleAction
			err = json.Unmarshal(message, &action)
			if err != nil {
				log.Println("Error parsing user vote:", err)
				continue
			}
			r.ConvertUserRole(u.Username, action.Role)
			emitUsersAndRevealableRound(r)
		}
	}
}

func RevealCurrentRound(room *room.Room) {
	if !room.CurrentRound.IsRevealable(len(room.Voters)) {
		log.Println("Cannot reveal round. Not enough votes. RoundId: ", room.Id)
		return
	}
	// event := events.RoundRevealedEvent{Event: events.Event{Type: events.RoundRevealed}, Votes: room.CurrentRound.Votes}
	room.CurrentRound.Revealed = true
	// Broadcast(event, room)
}
func emitUsersAndRevealableRound(room *room.Room) {
	users := make([]user.User, 0)
	for _, client := range room.Voters {
		users = append(users, user.User{Username: client.Username, IsVoter: true, HasVoted: room.UserHasVoted(client.Username)})
	}
	for _, client := range room.Spectators {
		users = append(users, user.User{Username: client.Username, IsVoter: false})
	}
	event := events.UsersUpdatedEvent{Users: users, Event: events.Event{Type: events.UsersUpdated}}
	Broadcast(event, room)
	if !room.CurrentRound.Revealed {
		revealableEvent := events.RoundRevealAvailableEvent{Event: events.Event{Type: events.RoundRevealAvailable}, RevealAvailable: room.CurrentRound.IsRevealable(len(room.Voters))}
		if room.CancelReveal != nil {
			room.CancelReveal <- true
		}
		Broadcast(revealableEvent, room)
	} else {
		RevealCurrentRound(room)
	}
}
func waitForCancelReveal(r *room.Room, reveal context.Context, cancel context.CancelFunc) {
	select {
	case <-r.CancelReveal:
		log.Println("Cancel reveal")
		r.CancelReveal = nil
		event := events.CancelRevealEvent{Event: events.Event{Type: events.CancelReveal}}
		Broadcast(event, r)
		cancel()
	case <-reveal.Done():
		RevealCurrentRound(r)
	}
	r.ResetCancelReveal()
}
func roomConnections(r *room.Room) []*Connection {
	connections := make([]*Connection, len(r.Voters)+len(r.Spectators))
	i := 0
	for range r.Voters {
		conn, found := clients[r.Voters[i].Username]
		if !found {
			log.Fatalf("failed to get conn for %s", r.Voters[i].Username)
		}
		connections[i] = conn
		i++
	}
	for j := range r.Spectators {
		conn, found := clients[r.Spectators[j].Username]
		if !found {
			log.Fatalf("failed to get conn for %s", r.Spectators[i].Username)
		}
		connections[i] = conn
		i++
	}
	return connections
}

func Broadcast(event events.Renderable, room *room.Room) {
	for _, connection := range roomConnections(room) {
		connection.Mu.Lock()
		defer connection.Mu.Unlock()
		if err := connection.WriteMessage(1, []byte(event.HTML(room))); err != nil {
			log.Println(err)
		}
	}
}
