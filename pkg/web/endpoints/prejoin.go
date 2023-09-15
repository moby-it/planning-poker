package endpoints

import (
	"html/template"
	"log"
	"net/http"
)

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

		if create != "1" {
			data.Title = "Join a Room"
			data.Text = "join room"
		}
		tmpl, err := template.ParseFiles("static/templates/prejoin.html", "static/templates/head.html", "static/templates/header.html")
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
