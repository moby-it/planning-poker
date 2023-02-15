package web_test

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"unicode/utf8"

	"github.com/George-Spanos/poker-planning/business/events"
	"github.com/George-Spanos/poker-planning/business/room"
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

		}
	}
}
func TestConnectVoter(t *testing.T) {
	t.Log("Given a user lands on the platform via a link")
	{
		t.Log("\tWhen the user tries to connect to a room")
		r := mux.NewRouter()
		r.HandleFunc("/{roomId}/{username}/{role}", handlers.ConnectToRoom)
		s := httptest.NewServer(r)
		defer s.Close()
		data := CreateRoomAndGetId(t)
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
	t.Log("Given a room is already created and a user is connected to it")
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
					t.Fatal("\t\tUser should receive a message", err)
				}
				var event events.UsersUpdatedEvent
				err = json.Unmarshal(msg, &event)
				if err != nil {
					t.Fatal("\t\tUser should receive a message", err)
				}
				t.Log("\t\tUser should receive a message")
			}
			t.Log("\t\tUser should receive a message")
			{

			}
		}
		defer ws.Close()
	}

}
func TestUserVotes(t *testing.T) {

}
func TestUserReceivesVote(t *testing.T) {

}
func TestRoundReveal(t *testing.T) {

}
