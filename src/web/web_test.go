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

	"github.com/George-Spanos/poker-planning/business/room"
	"github.com/George-Spanos/poker-planning/web/handlers"
	"github.com/George-Spanos/poker-planning/web/websockets"
	"github.com/George-Spanos/poker-planning/web/websockets/actions"
	"github.com/George-Spanos/poker-planning/web/websockets/events"
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
func CreateTestServer(t *testing.T) *httptest.Server {
	t.Helper()
	r := mux.NewRouter()
	r.HandleFunc("/createRoom", handlers.CreateRoom)
	r.HandleFunc("/{roomId}/{username}/{role}", handlers.ConnectToRoom)
	return httptest.NewServer(r)
}

func ConnectVoterToRoom(t *testing.T, roomId string, username string, url string) *websockets.Connection {
	t.Helper()
	wsURL := "ws" + strings.TrimPrefix(url, "http")
	ws, _, err := websocket.DefaultDialer.Dial(fmt.Sprintf("%v/%v/%v/%v", wsURL, roomId, username, "voter"), nil)
	if err != nil {
		t.Fatalf("User should be able to connect to the room %v", err)
	}
	return &websockets.Connection{Conn: ws}
}
func ConnectSpectatorToRoom(t *testing.T, roomId string, username string, url string) *websockets.Connection {
	t.Helper()
	wsURL := "ws" + strings.TrimPrefix(url, "http")
	ws, _, err := websocket.DefaultDialer.Dial(fmt.Sprintf("%v/%v/%v/%v", wsURL, roomId, username, "spectator"), nil)
	if err != nil {
		t.Fatalf("User should be able to connect to the room %v", err)
	}
	return &websockets.Connection{Conn: ws}

}
func UserVotesOnRoom(t *testing.T, connection *websockets.Connection, roomId string, username string, storyPoints int) {
	t.Helper()
	room, found := room.Get(roomId)
	room.Vote(username, storyPoints)
	connection.WriteJSON(actions.UserToVoteAction{Action: actions.Action{Type: actions.UserToVote}, Username: username, StoryPoints: storyPoints})
	if !found {
		t.Fatalf("Room %v should exist", roomId)
	}
}
func UserChangesRole(t *testing.T, connection *websocket.Conn, roomId string, username string, role string) {
	t.Helper()
	room, found := room.Get(roomId)
	room.ConvertUserRole(username, role)
	if !found {
		t.Fatalf("Room %v should exist", roomId)
	}
}

// testing if connection will receive the given event in the next 3 seconds
func ConnectionReceivedEvent(t *testing.T, username string, connection *websocket.Conn, expectedEvent string) {
	t.Helper()
	for {
		err := connection.SetReadDeadline(time.Now().Add(3 * time.Second))
		if err != nil {
			t.Fatalf("User should receive an event %v", err)
		}
		_, data, err := connection.ReadMessage()
		if err != nil {
			t.Fatalf("Read: User should receive an event %v", err)
		}
		var event events.Event
		err = json.Unmarshal(data, &event)
		if err != nil {
			t.Fatalf("Unmarshal:User should receive an event %v", err)
		}
		if event.Type == expectedEvent {
			t.Logf("\tUser %v got expected event %v", username, expectedEvent)
			break
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
	s := CreateTestServer(t)
	defer s.Close()
	t.Log("\tWhen the user tries to connect to a room as a voter")
	{
		roomId := string(data)
		username := "fasolakis"
		ws := ConnectVoterToRoom(t, roomId, username, s.URL)
		defer ws.Close()
		ConnectionReceivedEvent(t, username, ws.Conn, events.UsersUpdated)
		t.Log("\t\tUser should be able to connect to the room")
		{

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

	t.Log("Given a room is already created and a user is connected to it as a voter")
	{
		roomId := CreateRoomAndGetId(t)
		s := CreateTestServer(t)
		defer s.Close()
		username1 := "fasolakis"
		username2 := "george"
		ws1 := ConnectVoterToRoom(t, string(roomId), username1, s.URL)
		defer ws1.Close()
		ws2 := ConnectSpectatorToRoom(t, string(roomId), username2, s.URL)
		defer ws2.Close()
		{
			t.Log("\tWhen another user connects to the room")
			{
				ConnectionReceivedEvent(t, username1, ws1.Conn, events.UsersUpdated)
				ConnectionReceivedEvent(t, username2, ws2.Conn, events.UsersUpdated)
			}
			t.Log("\t\tUsers should reveive a userList update event")
		}

	}

}

func TestUserVotes(t *testing.T) {
	t.Log("Given a room is already created and three users are connected to it")
	{
		s := CreateTestServer(t)
		roomId := CreateRoomAndGetId(t)
		username := "fasolakis"
		ws := ConnectVoterToRoom(t, string(roomId), username, s.URL)
		username2 := "george"
		ws2 := ConnectVoterToRoom(t, string(roomId), username2, s.URL)
		username3 := "spiros"
		ws3 := ConnectVoterToRoom(t, string(roomId), username3, s.URL)
		t.Log("\tWhen a user votes")
		{
			UserVotesOnRoom(t, ws, string(roomId), username, 1)
			ConnectionReceivedEvent(t, username, ws.Conn, events.UserVoted)
			ConnectionReceivedEvent(t, username2, ws2.Conn, events.UserVoted)
			ConnectionReceivedEvent(t, username3, ws3.Conn, events.UserVoted)
			t.Log("\t\tUsers should reveive a vote update event")
		}
		t.Log("\t After all users have voted")
		{
			room, _ := room.Get(string(roomId))
			if room.CurrentRound.Revealed {
				t.Fatal("\t\tCurrent round should not be revealed. Expected: ", false, "Got: ", room.CurrentRound.Revealed)
			}
			t.Log("\t\tCurrent round should not be revealed")
		}
	}
}

func TestUserChangesRole(t *testing.T) {
	t.Log("Given a room is already created and a user is connected to it as a voter")
	{
		s := CreateTestServer(t)
		roomId := CreateRoomAndGetId(t)
		username := "fasolakis"
		ws := ConnectVoterToRoom(t, string(roomId), username, s.URL)
		username2 := "george"
		ws2 := ConnectSpectatorToRoom(t, string(roomId), username2, s.URL)
		t.Log("\tWhen a user changes role")
		{
			ws.WriteJSON(actions.ChangeRoleAction{Username: username, Role: "spectator", Action: actions.Action{Type: actions.ChangeRole}})
			t.Log("\t\tUsers should receive users list")
			{
				ConnectionReceivedEvent(t, username, ws.Conn, events.UsersUpdated)
				ConnectionReceivedEvent(t, username2, ws2.Conn, events.UsersUpdated)
			}
		}

	}
}
func TestToRevealRound(t *testing.T) {
	done := make(chan bool)
	t.Log("Given a room is created and users have already joined")
	{
		roomId := CreateRoomAndGetId(t)
		s := CreateTestServer(t)
		username := "fasolakis"
		ws := ConnectVoterToRoom(t, string(roomId), username, s.URL)
		username2 := "george"
		ws2 := ConnectVoterToRoom(t, string(roomId), username2, s.URL)

		t.Log("\tAfter users have voted")
		{
			UserVotesOnRoom(t, ws, string(roomId), username, 3)
			UserVotesOnRoom(t, ws2, string(roomId), username2, 3)
			room, _ := room.Get(string(roomId))
			if !room.CurrentRound.IsRevealable(len(room.Voters)) {
				t.Errorf("\tRound should be revealable")
			}
			t.Log("\t\t When a user tries to reveal a round")
			{
				ws.Mu.Lock()
				ws.WriteJSON(actions.RoundToRevealAction{Action: actions.Action{Type: actions.RoundToReveal}})
				ws.Mu.Unlock()
				t.Log("\t\t\tUsers should receive a round to reveal event")
				{
					ConnectionReceivedEvent(t, username, ws.Conn, events.RoundToReveal)
				}
				t.Log("\t\t When a user cancels a round reveal")
				{
					ws.Mu.Lock()
					ws.WriteJSON(actions.CancelRevealAction{Action: actions.Action{Type: actions.CancelReveal}})
					ws.Mu.Unlock()
					t.Log("\t\t\tUsers should receive a cancel reveal event")
					{
						ConnectionReceivedEvent(t, username, ws.Conn, events.CancelReveal)
					}
				}
				t.Log("\t\t When a user tries to reveal a round")
				{
					ws.WriteJSON(actions.RoundToRevealAction{Action: actions.Action{Type: actions.RoundToReveal}})
					t.Log("\t\t\tUsers should receive the round votes after the 5 seconds")
					{
						time.AfterFunc(5*time.Second, func() {
							ConnectionReceivedEvent(t, username, ws.Conn, events.RoundRevealed)
							done <- true
						})
					}
				}
				t.Log("\t\t Before a round is revealed")
				{
					if room.CurrentRound.Revealed {
						t.Error("\t\t\tRound should not be revealed")
					}
					t.Log("\t\t\tRound should not be revealed")
				}
				select {
				case <-done:
				case <-time.After(6 * time.Second):
					t.Errorf("\t\t\tShould have received a round revealed event")
				}
				t.Log("\t\t After a round is revealed")
				{
					if !room.CurrentRound.Revealed {
						t.Error("\t\t\tRound should be revealed")
					}
					t.Log("\t\t\tRound should be revealed")
				}
			}
		}
	}
}
func TestRoundReveal(t *testing.T) {
	t.Log("Given a room is created and users have already joined and already voted")
	roomId := CreateRoomAndGetId(t)
	s := CreateTestServer(t)
	username := "fasolakis"
	ws := ConnectVoterToRoom(t, string(roomId), username, s.URL)
	username2 := "george"
	ws2 := ConnectVoterToRoom(t, string(roomId), username2, s.URL)
	username3 := "spiros"
	_ = ConnectSpectatorToRoom(t, string(roomId), username3, s.URL)
	t.Log("\tAfter users have voted")
	{
		UserVotesOnRoom(t, ws, string(roomId), username, 3)
		UserVotesOnRoom(t, ws2, string(roomId), username2, 2)
		room, _ := room.Get(string(roomId))
		{
			{
				if !room.CurrentRound.IsRevealable(len(room.Voters)) {
					t.Fatal("\t\tRound should be revealable. Expected round to be revealable. Got: ", room.CurrentRound.IsRevealable(len(room.Voters)))
				}
				t.Log("\tRound should be revealable")

			}
			{
				ConnectionReceivedEvent(t, username, ws.Conn, events.RoundRevealAvailable)
				ConnectionReceivedEvent(t, username, ws2.Conn, events.RoundRevealAvailable)
				t.Log("\tUsers should receive a round revealable event")
			}
			t.Log("\tWhen a user reveals the round")
			websockets.RevealCurrentRound(room)
			{
				ConnectionReceivedEvent(t, username, ws.Conn, events.RoundRevealed)
				ConnectionReceivedEvent(t, username2, ws2.Conn, events.RoundRevealed)
				t.Log("\tUsers should receive a round revealed event")
			}
		}
	}
}
