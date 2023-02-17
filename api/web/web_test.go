package web_test

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
	"unicode/utf8"

	"github.com/George-Spanos/poker-planning/business/events"
	"github.com/George-Spanos/poker-planning/business/room"
	"github.com/George-Spanos/poker-planning/business/user"
	"github.com/George-Spanos/poker-planning/web/handlers"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

func CreateRoomAndGetId(t *testing.T) []byte {
	t.Helper()
	r := httptest.NewRequest(http.MethodPost, "/createRoom", nil)
	w := httptest.NewRecorder()
	handlers.CreateRoom(w, r)
	res := w.Result()
	defer res.Body.Close()
	data, err := io.ReadAll(res.Body)
	if err != nil {
		t.Fatal("A room should be created", err)
	}
	return data
}
func ConnectVoterToRoom(t *testing.T, roomId string, username string) *websocket.Conn {
	t.Helper()
	r := mux.NewRouter()
	r.HandleFunc("/{roomId}/{username}/{role}", handlers.ConnectToRoom)
	s := httptest.NewServer(r)
	defer s.Close()
	wsURL := "ws" + strings.TrimPrefix(s.URL, "http")
	ws, _, err := websocket.DefaultDialer.Dial(fmt.Sprintf("%v/%v/%v/%v", wsURL, roomId, username, "voter"), nil)
	if err != nil {
		t.Fatalf("User should be able to connect to the room %v", err)
	}
	return ws
}
func ConnectSpectatorToRoom(t *testing.T, roomId string, username string) *websocket.Conn {
	t.Helper()
	r := mux.NewRouter()
	r.HandleFunc("/{roomId}/{username}/{role}", handlers.ConnectToRoom)
	s := httptest.NewServer(r)
	defer s.Close()
	wsURL := "ws" + strings.TrimPrefix(s.URL, "http")
	ws, _, err := websocket.DefaultDialer.Dial(fmt.Sprintf("%v/%v/%v/%v", wsURL, roomId, username, "spectator"), nil)
	if err != nil {
		t.Fatalf("User should be able to connect to the room %v", err)
	}
	return ws
}
func UserVotesOnRoom(t *testing.T, connection *user.Connection, roomId string, username string, storyPoints int) {
	t.Helper()
	room, found := room.Get(roomId)
	room.Vote(username, storyPoints)
	if !found {
		t.Fatalf("Room %v should exist", roomId)
	}
}

// testing if connection will receive the given event in the next 10 seconds
func ConnectionReceivedEvent(t *testing.T, connection *user.Connection, expectedEvent string) {
	t.Helper()
	timeout := time.After(10 * time.Second)
	ticker := time.NewTicker(300 * time.Millisecond)
	select {
	case <-timeout:
		t.Fatalf("User %v should receive event %v", connection.Username, expectedEvent)
	case <-ticker.C:
		_, data, err := connection.ReadMessage()
		if err != nil {
			t.Fatalf("User should receive an event %v", err)
		}
		var event events.Event
		err = json.Unmarshal(data, &event)
		if err != nil {
			t.Fatalf("User should receive an event %v", err)
		}
		t.Log("Received event: ", event.Type)
		t.Log("Expected event: ", expectedEvent)
		if event.Type == expectedEvent {
			t.Logf("User %v got expected event %v", connection.Username, expectedEvent)
			ticker.Stop()
		}
	}
}
func TestCreateRoom(t *testing.T) {
	t.Log("Given a user lands on the platform")
	{
		t.Log("\tWhen the user creates a room")
		{
			roomId := CreateRoomAndGetId(t)
			t.Log("\t\tThen the room should be created")

			if !utf8.Valid(roomId) {
				t.Fatalf("\t\tinvalid room id. Value is not string: %v", roomId)
			}
			t.Log("\t\tRoom id should be a string")

			if room.GetLength() != 1 {
				t.Fatal("\t\tRoom should be added to the Rooms map. Expected length of 1. Got: ", room.GetLength())
			}
			t.Log("\t\tRoom should be added to the Rooms map")

			if r, found := room.Get(string(roomId)); !found || r.CurrentRound == nil {
				t.Fatal("\t\tRoom should have a round. Expected round to be not nil. Got: ", r.CurrentRound)
			}
			t.Log("\t\tRoom should have a round")
		}
	}
}
func TestConnectVoter(t *testing.T) {
	t.Log("Given a user lands on the platform via a link")
	data := CreateRoomAndGetId(t)
	r := mux.NewRouter()
	r.HandleFunc("/{roomId}/{username}/{role}", handlers.ConnectToRoom)
	s := httptest.NewServer(r)
	defer s.Close()
	t.Log("\tWhen the user tries to connect to a room as a voter")
	{
		{
			roomId := string(data)
			username := "fasolakis"
			ws := ConnectVoterToRoom(t, roomId, username)
			t.Log("\t\tUser should be able to connect to the room")

			defer ws.Close()

			room, _ := room.Get(roomId)
			if len(room.Voters) != 1 {
				t.Fatal("\t\tRoom should have one voter. Expected length of 1. Got: ", len(room.Voters))
			}
			t.Log("\t\tRoom should have one voter")

			if room.Voters[0].Username != username {
				t.Fatal("\t\tUser should be added to the room. Expected username: ", username, "Got: ", room.Voters[0].Username)
			}
			t.Logf("\t\tUser named %v should be added to the room", username)
		}
	}

}
func TestSpectatorJoinsRoom(t *testing.T) {
	t.Log("Given a room is already created and a user is connected to it ασ α voter")
	{
		roomId := CreateRoomAndGetId(t)
		usename := "fasolakis"
		ws := ConnectVoterToRoom(t, string(roomId), usename)
		{
			t.Log("\tWhen another user connects to the room")
			{
				username := "george"
				ws2 := ConnectSpectatorToRoom(t, string(roomId), username)
				defer ws2.Close()
				_, msg, err := ws.ReadMessage()
				if err != nil {
					t.Fatal("\t\tUsers should reveive a userList update event", err)
				}
				var event events.UsersUpdatedEvent
				err = json.Unmarshal(msg, &event)
				if err != nil {
					t.Fatal("\t\tUsers should reveive a userList update event", err)
				}
			}
			t.Log("\t\tUsers should reveive a userList update event")
		}
		defer ws.Close()
	}

}
func TestUserVotes(t *testing.T) {
	t.Log("Given a room is already created and three users are connected to it")
	{
		roomId := CreateRoomAndGetId(t)
		usename := "fasolakis"
		ws := ConnectVoterToRoom(t, string(roomId), usename)
		username2 := "george"
		ws2 := ConnectVoterToRoom(t, string(roomId), username2)
		username3 := "spiros"
		ws3 := ConnectVoterToRoom(t, string(roomId), username3)
		t.Log("\tWhen a user votes")
		{
			connection := &user.Connection{Conn: ws, User: user.User{Username: usename, IsVoter: true}}
			connection2 := &user.Connection{Conn: ws2, User: user.User{Username: username2, IsVoter: true}}
			connection3 := &user.Connection{Conn: ws3, User: user.User{Username: username3, IsVoter: true}}
			UserVotesOnRoom(t, connection, string(roomId), usename, 1)
			ConnectionReceivedEvent(t, connection, events.UserVoted)
			ConnectionReceivedEvent(t, connection2, events.UserVoted)
			ConnectionReceivedEvent(t, connection3, events.RoundStarted) // should fail
			t.Log("\t\tUsers should reveive a vote update event")
		}
	}
}
func TestRoundReveal(t *testing.T) {
	t.Log("Given a room is created, user have joined and already voted")
	roomId := CreateRoomAndGetId(t)
	usename := "fasolakis"
	ws := ConnectVoterToRoom(t, string(roomId), usename)
	username2 := "george"
	ws2 := ConnectVoterToRoom(t, string(roomId), username2)
	username3 := "spiros"
	_ = ConnectSpectatorToRoom(t, string(roomId), username3)
	t.Log("\tAfter users have voted")
	{
		connection := &user.Connection{Conn: ws, User: user.User{Username: usename, IsVoter: true}}
		UserVotesOnRoom(t, connection, string(roomId), usename, 3)
		connection2 := &user.Connection{Conn: ws2, User: user.User{Username: username2, IsVoter: true}}
		UserVotesOnRoom(t, connection2, string(roomId), username2, 2)
		{
			{
				room, _ := room.Get(string(roomId))
				if !room.CurrentRound.IsRevealable(len(room.Voters)) {
					t.Fatal("\t\tRound should be revealable. Expected round to be revealable. Got: ", room.CurrentRound.IsRevealable(len(room.Voters)))
				}
				t.Log("\tRound should be revealable")

			}
			{
				ConnectionReceivedEvent(t, connection, events.RoundRevealAvailable)
				ConnectionReceivedEvent(t, connection2, events.RoundRevealAvailable)
				t.Log("\tUsers should receive a round revealable event")
			}
		}
	}
}
