package handlers

import (
	"html/template"
	"log"
	"net/http"

	"github.com/George-Spanos/poker-planning/business/room"
	"github.com/gorilla/mux"
)

func ServeRoom(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	roomId, ok := vars["roomId"]
	if !ok {
		log.Println("missing room id from request")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	_, found := room.Get(roomId)
	if !found {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	tmpl, err := template.ParseFiles("web/templates/room.html", "web/templates/head.html", "web/templates/header.html")
	if err != nil {
		http.Error(w, "Unexpected error occured", http.StatusInternalServerError)
	}
	tmpl.Execute(w, nil)

}
func ServePrejoin(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		data := struct {
			Title string
			Text  string
		}{
			Title: "Create a New Room",
			Text:  "create room",
		}
		create := r.URL.Query().Get("create")

		if create != "true" {
			data.Title = "Join a Room"
			data.Text = "join room"
		}
		tmpl, err := template.ParseFiles("web/templates/prejoin.html", "web/templates/head.html", "web/templates/header.html")
		if err != nil {
			log.Println(err)
		}
		err = tmpl.Execute(w, data)
		if err != nil {
			log.Println(err)
		}
	} else {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}
func ServeHome(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("web/templates/index.html", "web/templates/head.html", "web/templates/header.html")
	if err != nil {
		log.Println(err)
	}
	err = tmpl.Execute(w, nil)
	if err != nil {
		log.Println(err)
	}
}
