package web

import (
	"html/template"
	"log"
	"net/http"
	"time"

	"github.com/George-Spanos/poker-planning/web/handlers"
	h "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

func StartApp() error {
	r := mux.NewRouter()
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("app healthy"))
	}).Methods("GET")
	fs := http.FileServer(http.Dir("web/static"))
	http.Handle("/static", fs)
	r.PathPrefix("/scripts/").Handler(http.StripPrefix("/scripts/", http.FileServer(http.Dir("web/static"))))
	r.PathPrefix("/styles/").Handler(http.StripPrefix("/styles/", http.FileServer(http.Dir("web/static"))))

	// serve templates folder as static
	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		data := map[string]interface{}{
			"Title": "Poker Planning",
		}
		tmpl, err := template.ParseFiles("web/templates/index.html", "web/templates/head.html")
		if err != nil {
			log.Println(err)
		}
		err = tmpl.Execute(w, data)
		if err != nil {
			log.Println(err)
		}
	})

	// attachProfiler(r)
	apiRouter := r.PathPrefix("/api").Subrouter()
	// v1 Handlers
	v1Router := apiRouter.PathPrefix("/v1").Subrouter()
	v1Router.HandleFunc("/createRoom", handlers.CreateRoom).Methods("POST")
	v1Router.HandleFunc("/joinRoom/{roomId}/{username}/{role}", handlers.ConnectToRoom)

	originsOk := h.AllowedOrigins([]string{"*"})

	srv := &http.Server{
		Handler:      h.CORS(originsOk)(r),
		Addr:         "0.0.0.0:8080",
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
