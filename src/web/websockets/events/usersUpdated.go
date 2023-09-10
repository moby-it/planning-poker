package events

import (
	"github.com/George-Spanos/poker-planning/business/user"
)

type UsersUpdatedEvent struct {
	Event
	Users []user.User `json:"users"`
}

// func (e *UsersUpdatedEvent) Html(room room.Room) string {
// 	tmpl, err := template.ParseFiles("web/templates/board.html")

// }
