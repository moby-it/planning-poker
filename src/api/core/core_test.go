package core_test

import (
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"unicode/utf8"

	"github.com/George-Spanos/poker-planning/core"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

func CreateRoomAndGetId(t *testing.T) string {
	t.Helper()
	r := httptest.NewRequest(http.MethodPost, "/createRoom", nil)
	w := httptest.NewRecorder()
	core.CreateRoom(w, r)
	res := w.Result()
	defer res.Body.Close()
	data, err := io.ReadAll(res.Body)
	if err != nil {
		return ""
	}
	return string(data)
}
func TestCreateRoom(t *testing.T) {
	r := httptest.NewRequest(http.MethodPost, "/createRoom", nil)
	w := httptest.NewRecorder()
	core.CreateRoom(w, r)
	res := w.Result()
	defer res.Body.Close()
	data, err := io.ReadAll(res.Body)
	if err != nil {
		t.Errorf("expected error to be nil got %v", err)
	}
	if !utf8.Valid(data) {
		t.Errorf("invalid room id. Value is not string: %v", err)
	}
	if len(core.Rooms) != 1 {
		t.Error("expected rooms to have length of 1")
	}
}
func TestConnectUser(t *testing.T) {
	r := mux.NewRouter()
	r.HandleFunc("/{roomId}/{username}", core.Connect)
	s := httptest.NewServer(r)
	defer s.Close()
	roomId := CreateRoomAndGetId(t)
	wsURL := "ws" + strings.TrimPrefix(s.URL, "http")

	ws, _, err := websocket.DefaultDialer.Dial(fmt.Sprintf("%v/%v/fasolakis", wsURL, roomId), nil)
	if err != nil {
		t.Fatalf("%v", err)
	}
	defer ws.Close()
	room := core.Rooms[roomId]
	if len(room.Voters) != 1 {
		t.Error("expected room voters to have length of 1")
	}
}
