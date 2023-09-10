package websockets

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/George-Spanos/poker-planning/business/room"
	"github.com/George-Spanos/poker-planning/business/user"
	"github.com/George-Spanos/poker-planning/web/websockets/actions"
	"github.com/George-Spanos/poker-planning/web/websockets/events"
)

const (

	// Time allowed to read the next pong message from the peer.
	pongWait = 5 * time.Minute

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

func readMessage(client *user.Connection, r *room.Room) {
	defer client.Close()
	client.SetReadLimit(maxMessageSize)
	client.SetReadDeadline(time.Now().Add(pongWait))
	for {
		_, message, err := client.ReadMessage()
		if err != nil {
			log.Printf("Client %v: error: %v", client.Username, err)
			if client.IsVoter && r.CancelReveal != nil {
				r.CancelReveal <- true
			}
			r.RemoveClient(client)
			if !r.CurrentRound.Revealed {
				emitUsersAndRevealableRound(r)
			}
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
			continue
		}
		switch a.Type {
		case actions.Ping:
			client.SetReadDeadline(time.Now().Add(pongWait))
			log.Printf("%v refreshed connection deadline", client.Username)
			// client.WriteJSON(events.PongEvent{Event: events.Event{Type: events.Pong}})
		case actions.UserToVote:
			var action actions.UserToVoteAction
			err = json.Unmarshal(message, &action)
			if err != nil {
				log.Println("Error parsing user vote:", err)
				continue
			}
			r.Vote(client.Username, action.StoryPoints)
			event := events.UserVotedEvent{Username: client.Username, Event: events.Event{Type: events.UserVoted}}
			events.Broadcast(event, r)
			revealEvent := events.RoundRevealAvailableEvent{Event: events.Event{Type: events.RoundRevealAvailable}, RevealAvailable: r.CurrentRound.IsRevealable(len(r.Voters))}
			events.Broadcast(revealEvent, r)
		case actions.RoundToReveal:
			// event := events.RoundToRevealEvent{Event: events.Event{Type: events.RoundToReveal}, After: 5000} // after in ms
			// events.Broadcast(event, room.Connections()...)
			reveal, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			r.Mu.RLock()
			r.CancelReveal = make(chan bool, 1)
			r.Mu.RUnlock()
			go waitForCancelReveal(r, reveal, cancel)
		case actions.CancelReveal:
			r.CancelReveal <- true
		case actions.RoundToStart:
			r.CurrentRound = room.NewRound()
			event := events.RoundStartedEvent{Event: events.Event{Type: events.RoundStarted}}
			events.Broadcast(event, r)
			emitUsersAndRevealableRound(r)
		case actions.ChangeRole:
			var action actions.ChangeRoleAction
			err = json.Unmarshal(message, &action)
			if err != nil {
				log.Println("Error parsing user vote:", err)
				continue
			}
			r.ConvertUserRole(client.Username, action.Role)
			emitUsersAndRevealableRound(r)
		}
	}
}

// a client can either connect as a "voter" or a "spectator". Any other role will result in panic
func AddClient(client *user.Connection, room *room.Room, role string) error {
	switch role {
	case "voter":
		room.Voters = append(room.Voters, client)
	case "spectator":
		room.Spectators = append(room.Spectators, client)
	}
	emitUsersAndRevealableRound(room)

	go readMessage(client, room)
	log.Printf("%v joined room %v", client.Username, room.Id)
	return nil
}

func RevealCurrentRound(room *room.Room) {
	if !room.CurrentRound.IsRevealable(len(room.Voters)) {
		log.Println("Cannot reveal round. Not enough votes. RoundId: ", room.Id)
		return
	}
	// event := events.RoundRevealedEvent{Event: events.Event{Type: events.RoundRevealed}, Votes: room.CurrentRound.Votes}
	room.CurrentRound.Revealed = true
	// events.Broadcast(event, room.Connections()...)
}
func emitUsersAndRevealableRound(room *room.Room) {
	users := make([]user.User, 0)
	for _, client := range room.Voters {
		users = append(users, user.User{Username: client.Username, IsVoter: true, HasVoted: room.UserHasVoted(client.Username)})
	}
	for _, client := range room.Spectators {
		users = append(users, user.User{Username: client.Username, IsVoter: false})
	}
	// event := events.UsersUpdatedEvent{Users: users, Event: events.Event{Type: events.UsersUpdated}}
	// events.Broadcast(event, room.Connections()...)
	room.Mu.RLock()
	if !room.CurrentRound.Revealed {
		revealableEvent := events.RoundRevealAvailableEvent{Event: events.Event{Type: events.RoundRevealAvailable}, RevealAvailable: room.CurrentRound.IsRevealable(len(room.Voters))}
		room.Mu.RUnlock()
		if room.CancelReveal != nil {
			room.CancelReveal <- true
		}
		events.Broadcast(revealableEvent, room)
	} else {
		RevealCurrentRound(room)
	}
}
func waitForCancelReveal(room *room.Room, reveal context.Context, cancel context.CancelFunc) {
	select {
	case <-room.CancelReveal:
		log.Println("Cancel reveal")
		event := events.CancelRevealEvent{Event: events.Event{Type: events.CancelReveal}}
		events.Broadcast(event, room)
		cancel()
	case <-reveal.Done():
		RevealCurrentRound(room)
	}
	room.Mu.RLock()
	room.CancelReveal = nil
	room.Mu.RUnlock()
}
