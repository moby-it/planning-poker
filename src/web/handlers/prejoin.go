package handlers

import (
	"html/template"
	"log"
	"net/http"
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
			templateData.Text = "join room"
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
