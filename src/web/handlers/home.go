package handlers

import (
	"html/template"
	"log"
	"net/http"
)

func ServeHome(w http.ResponseWriter, r *http.Request) {
	templates := []string{"index.html", "head.html", "header.html"}
	tmpl, err := template.ParseFiles(addPrefix(templates)...)
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
