package endpoints

import (
	"fmt"
	"html/template"
	"log"
	"net/http"

	"github.com/George-Spanos/poker-planning/business/room"
)

func ServePrejoin(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		templateData := struct {
			Title    string
			Text     string
			ShowLogo bool
		}{
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
	} else {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func Prejoin(w http.ResponseWriter, r *http.Request) {
	roomId := r.URL.Query().Get("roomId")
	username := r.FormValue("username")
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
