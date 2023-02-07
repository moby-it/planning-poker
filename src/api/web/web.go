package web

import (
	"log"
	"net/http"
	"time"

	"github.com/George-Spanos/poker-planning/business"
	"github.com/gorilla/mux"
)

func StartApp() error {
	r := mux.NewRouter()
	r.HandleFunc("/{roomId}/{username}", business.Connect)
	r.HandleFunc("/createRoom", business.CreateRoom)
	srv := &http.Server{
		Handler: r,
		Addr:    "127.0.0.1:8080",
		// Good practice: enforce timeouts for servers you create!
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}
	log.Println("Listening on port 8080")
	return srv.ListenAndServe()
}
