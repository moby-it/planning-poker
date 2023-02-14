package web

import (
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
)

const prefix = "/api"

func StartApp() error {
	r := mux.NewRouter()
	// attachProfiler(r)
	apiRouter := r.PathPrefix(prefix).Subrouter()

	// v1 Handlers
	v1Router := apiRouter.PathPrefix("/v1").Subrouter()
	v1Router.HandleFunc("/createRoom", CreateRoom).Methods("POST")
	v1Router.HandleFunc("/joinRoom/{roomId}/{username}", ConnectToRoom)

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

// func attachProfiler(router *mux.Router) {
// 	router.HandleFunc("/debug/pprof/", pprof.Index)
// 	router.HandleFunc("/debug/pprof/cmdline", pprof.Cmdline)
// 	router.HandleFunc("/debug/pprof/profile", pprof.Profile)
// 	router.HandleFunc("/debug/pprof/symbol", pprof.Symbol)
// 	router.HandleFunc("/debug/pprof/trace", pprof.Trace)
// }
