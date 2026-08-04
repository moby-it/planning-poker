package web_test

import (
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/George-Spanos/poker-planning/business/room"
	"github.com/George-Spanos/poker-planning/web"
)

// Every page has to be a real document served at its own URL: the e2e suite
// deep links into rooms, and a shared link has to work in a cold browser.
func TestPageRoutes(t *testing.T) {
	server := httptest.NewServer(web.Router())
	defer server.Close()

	created := room.New("tshirt")

	tests := []struct {
		name     string
		path     string
		wantBody string
	}{
		{name: "home", path: "/", wantBody: `data-testid="title"`},
		{name: "create a room", path: "/prejoin?create=true", wantBody: `data-testid="scale-select"`},
		{name: "join a room", path: "/prejoin?roomId=" + created.Id, wantBody: `data-testid="username-input"`},
		{name: "a room", path: "/room/" + created.Id, wantBody: `data-testid="room"`},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			res, err := http.Get(server.URL + tt.path)
			if err != nil {
				t.Fatalf("requesting %v: %v", tt.path, err)
			}
			defer res.Body.Close()

			if res.StatusCode != http.StatusOK {
				t.Fatalf("GET %v: status %v, want 200", tt.path, res.StatusCode)
			}
			body, _ := io.ReadAll(res.Body)
			if !strings.Contains(string(body), tt.wantBody) {
				t.Errorf("GET %v: body is missing %v", tt.path, tt.wantBody)
			}
		})
	}
}

// A room only exists while someone is in it, so a stale link has to lead
// somewhere useful instead of to an empty board.
func TestRoomThatDoesNotExistSendsTheVisitorHome(t *testing.T) {
	server := httptest.NewServer(web.Router())
	defer server.Close()

	client := &http.Client{
		CheckRedirect: func(*http.Request, []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}
	res, err := client.Get(server.URL + "/room/not-a-room")
	if err != nil {
		t.Fatalf("requesting a missing room: %v", err)
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusSeeOther {
		t.Fatalf("status = %v, want %v", res.StatusCode, http.StatusSeeOther)
	}
	if location := res.Header.Get("Location"); location != "/" {
		t.Errorf("Location = %q, want %q", location, "/")
	}
}

// The pages reference the assets by path, so a rename that misses one has to
// fail here rather than in a browser.
func TestAssetsAreServed(t *testing.T) {
	server := httptest.NewServer(web.Router())
	defer server.Close()

	assets := []string{
		"/static/js/main.js",
		"/static/js/room.js",
		"/static/css/colors.css",
		"/static/css/components/card.css",
		"/static/assets/cup-medium.svg",
	}

	for _, asset := range assets {
		res, err := http.Get(server.URL + asset)
		if err != nil {
			t.Fatalf("requesting %v: %v", asset, err)
		}
		res.Body.Close()
		if res.StatusCode != http.StatusOK {
			t.Errorf("GET %v: status %v, want 200", asset, res.StatusCode)
		}
		if res.Header.Get("ETag") == "" {
			t.Errorf("GET %v: no ETag", asset)
		}
	}
}

func TestUnchangedAssetIsNotResent(t *testing.T) {
	server := httptest.NewServer(web.Router())
	defer server.Close()

	first, err := http.Get(server.URL + "/static/css/colors.css")
	if err != nil {
		t.Fatalf("first request: %v", err)
	}
	first.Body.Close()

	request, _ := http.NewRequest(http.MethodGet, server.URL+"/static/css/colors.css", nil)
	request.Header.Set("If-None-Match", first.Header.Get("ETag"))
	second, err := http.DefaultClient.Do(request)
	if err != nil {
		t.Fatalf("second request: %v", err)
	}
	second.Body.Close()

	if second.StatusCode != http.StatusNotModified {
		t.Errorf("status = %v, want %v", second.StatusCode, http.StatusNotModified)
	}
}
