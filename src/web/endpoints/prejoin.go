package endpoints

import (
	"fmt"
	"html/template"
	"log"
	"net/http"

	"github.com/George-Spanos/poker-planning/business/room"
)

type PrejoinTemplateData struct {
	Title    string
	Text     string
	ShowLogo bool
	Error    string
}

func ServePrejoin(w http.ResponseWriter, r *http.Request) {
	templateData := PrejoinTemplateData{
		Title:    "Create a New Room",
		Text:     "Create Room",
		ShowLogo: true,
	}
	create := r.URL.Query().Get("create")

	if create != "1" {
		templateData.Title = "Join a Room"
		templateData.Text = "Join Room"
	}
	templates := []string{"prejoin.html", "head.html", "header.html"}
	tmpl, err := template.ParseFiles(addPrefix(templates)...)
	if err != nil {
		log.Println(err)
	}
	err = tmpl.Execute(w, templateData)
	if err != nil {
		log.Println(err)
	}
}

func Prejoin(w http.ResponseWriter, r *http.Request) {
	roomId := r.URL.Query().Get("roomId")
	username := r.FormValue("username")
	if len(username) >= 12 {
		w.Write([]byte(`<span id="error" hx-swap-oob="true">Username has to be smaller than 12 characters</span>`))
		return
	}
	isSpectator := r.FormValue("isSpectator")
	var role string
	if isSpectator == "" {
		role = "voter"
	} else {
		role = "spectator"
	}
	if roomId == "" {
		room := room.New()
		roomId = room.Id
	} else {
		room, found := room.Get(roomId)
		if !found {
			w.WriteHeader(http.StatusNotFound)
			return
		}
		if room.IncludeUsername(username) {
			w.WriteHeader(http.StatusConflict)
			return
		}
	}
	w.Header().Add("HX-Redirect", fmt.Sprintf("/room/%s?username=%s&role=%s", roomId, username, role))
}
