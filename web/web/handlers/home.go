package handlers

import (
	"html/template"
	"log"
	"net/http"
)

func ServeHome(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("web/templates/index.html", "web/templates/head.html", "web/templates/header.html")
	if err != nil {
		log.Println(err)
	}
	err = tmpl.Execute(w, struct {
		ShowLogo bool
	}{ShowLogo: false})
	if err != nil {
		log.Println(err)
	}
}
