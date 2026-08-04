package render_test

import (
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/George-Spanos/poker-planning/business/scales"
	"github.com/George-Spanos/poker-planning/web/render"
)

// The e2e suite drives the app entirely through these hooks. Losing one to a
// template edit would break the suite in a way that is tedious to trace back,
// so each page is checked for the ones it owns.
func TestPagesRenderTheHooksTheSuiteReliesOn(t *testing.T) {
	tests := []struct {
		page string
		data any
		want []string
	}{
		{
			page: "home",
			want: []string{`data-testid="title"`, `data-testid="start-here"`},
		},
		{
			page: "prejoin",
			data: struct {
				Creating bool
				RoomId   string
				Scales   []scales.Scale
			}{Creating: true, Scales: scales.All()},
			want: []string{
				`data-testid="username-input"`,
				`data-testid="create-room"`,
				`data-testid="scale-select"`,
				`data-testid="spectator-toggle"`,
			},
		},
		{
			page: "room",
			data: struct {
				RoomId string
				Scale  scales.Scale
			}{RoomId: "a-room", Scale: scales.Get("fibonacci")},
			want: []string{
				`data-testid="room"`,
				`data-testid="voting-card-list"`,
				`data-testid="voting-card-0"`,
				`data-testid="voting-card-1000"`,
				`data-testid="spectator-toggle"`,
				`data-testid="stats-container"`,
				`data-testid="sort-controls"`,
				`data-testid="sort-btn-none"`,
				`data-testid="sort-btn-asc"`,
				`data-testid="sort-btn-desc"`,
				`data-room-id="a-room"`,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.page, func(t *testing.T) {
			body := renderPage(t, tt.page, tt.data)
			for _, want := range tt.want {
				if !strings.Contains(body, want) {
					t.Errorf("page %q is missing %s", tt.page, want)
				}
			}
		})
	}
}

// The suite counts board cards by class, so a voting card must never look like
// one.
func TestVotingCardsAreNotBoardCards(t *testing.T) {
	body := renderPage(t, "room", struct {
		RoomId string
		Scale  scales.Scale
	}{RoomId: "a-room", Scale: scales.Get("fibonacci")})

	if strings.Contains(body, `class="voting-card card`) || strings.Contains(body, `class="card voting-card`) {
		t.Error("a voting card also carries the board card class")
	}
}

func TestRoomRendersTheCardsOfItsOwnScale(t *testing.T) {
	body := renderPage(t, "room", struct {
		RoomId string
		Scale  scales.Scale
	}{RoomId: "a-room", Scale: scales.Get("tshirt")})

	if !strings.Contains(body, `data-label="XXL"`) {
		t.Error("a t-shirt room should offer the XXL card")
	}
	if strings.Contains(body, `data-label="89"`) {
		t.Error("a t-shirt room should not offer fibonacci cards")
	}
	if !strings.Contains(body, `data-numeric="false"`) {
		t.Error("a t-shirt room should be marked as non numeric")
	}
}

func TestUnknownPageIsNotFound(t *testing.T) {
	w := httptest.NewRecorder()
	render.Page(w, "nope", nil)
	if w.Result().StatusCode != 404 {
		t.Errorf("status = %d, want 404", w.Result().StatusCode)
	}
}

func renderPage(t *testing.T, name string, data any) string {
	t.Helper()
	w := httptest.NewRecorder()
	render.Page(w, name, data)

	res := w.Result()
	defer res.Body.Close()
	if res.StatusCode != 200 {
		t.Fatalf("rendering %q: status %d", name, res.StatusCode)
	}
	return w.Body.String()
}
