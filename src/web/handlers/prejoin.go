package handlers

import (
	"html/template"
	"log"
	"net/http"
)

func ServePrejoin(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		templateData := struct {
			Title string
			Text  string
		}{
			Title: "Create a New Room",
			Text:  "Create Room",
		}
		create := r.URL.Query().Get("create")

		if create != "1" {
			templateData.Title = "Join a Room"
			templateData.Text = "join room"
		}
		tmpl, err := template.ParseFiles("web/templates/prejoin.html", "web/templates/head.html", "web/templates/header.html")
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
