package main

import (
	"log"
	"net/http"
	"time"

	"github.com/George-Spanos/poker-planning/core"
	"github.com/gorilla/mux"
)

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/{roomdId}/{username}", core.Connect)
	r.HandleFunc("/createRoom", core.CreateRoom)
	srv := &http.Server{
		Handler: r,
		Addr:    "127.0.0.1:8080",
		// Good practice: enforce timeouts for servers you create!
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}
	log.Println("Listening on port 8080")
	srv.ListenAndServe()
}
