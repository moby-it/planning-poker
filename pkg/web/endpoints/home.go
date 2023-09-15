package endpoints

import (
	"html/template"
	"log"
	"net/http"
)

func ServeHome(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("static/templates/index.html", "static/templates/head.html", "static/templates/header.html")
	if err != nil {
		log.Println(err)
	}
	err = tmpl.Execute(w, nil)
	if err != nil {
		log.Println(err)
	}
}
