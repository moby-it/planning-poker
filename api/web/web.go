package web

import (
	"log"
	"net/http"
	"time"

	"github.com/George-Spanos/poker-planning/web/handlers"
	h "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

func StartApp() error {
	r := mux.NewRouter()

	// attachProfiler(r)

	// v1 Handlers
	v1Router := r.PathPrefix("/v1").Subrouter()
	v1Router.HandleFunc("/createRoom", handlers.CreateRoom).Methods("POST")
	v1Router.HandleFunc("/joinRoom/{roomId}/{username}/{role}", handlers.ConnectToRoom)

	originsOk := h.AllowedOrigins([]string{"*"})

	srv := &http.Server{
		Handler: h.CORS(originsOk)(r),
		Addr:    "0.0.0.0:8080",
		// Good practice: enforce timeouts for servers you create!
		WriteTimeout: 30 * time.Second,
		ReadTimeout:  30 * time.Second,
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
