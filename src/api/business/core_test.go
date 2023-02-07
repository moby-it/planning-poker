package business_test

import (
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"unicode/utf8"

	"github.com/George-Spanos/poker-planning/business"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

func CreateRoomAndGetId(t *testing.T) ([]byte, error) {
	t.Helper()
	r := httptest.NewRequest(http.MethodPost, "/createRoom", nil)
	w := httptest.NewRecorder()
	business.CreateRoom(w, r)
	res := w.Result()
	defer res.Body.Close()
	data, err := io.ReadAll(res.Body)
	if err != nil {
		return []byte{}, err
	}
	return data, nil
}
func TestCreateRoom(t *testing.T) {
	roomId, err := CreateRoomAndGetId(t)
	if err != nil {
		t.Fatalf("expected error to be nil got %v", err)
	}
	if !utf8.Valid(roomId) {
		t.Errorf("invalid room id. Value is not string: %v", err)
	}
	if len(business.Rooms) != 1 {
		t.Error("expected rooms to have length of 1")
	}
}
func TestConnectUser(t *testing.T) {
	r := mux.NewRouter()
	r.HandleFunc("/{roomId}/{username}", business.Connect)
	s := httptest.NewServer(r)
	defer s.Close()
	data, err := CreateRoomAndGetId(t)
	if err != nil {
		t.Fatal("Test Connect User: failed to create room")
	}
	if !utf8.Valid(data) {
		t.Errorf("invalid room id. Value is not string: %v", err)
	}
	roomId := string(data)
	wsURL := "ws" + strings.TrimPrefix(s.URL, "http")

	ws, _, err := websocket.DefaultDialer.Dial(fmt.Sprintf("%v/%v/fasolakis", wsURL, roomId), nil)

	if err != nil {
		t.Fatalf("%v", err)
	}
	defer ws.Close()
	room := business.Rooms[roomId]
	if len(room.Voters) != 1 {
		t.Error("expected room voters to have length of 1")
	}
}
