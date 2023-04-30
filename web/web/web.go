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

	// register static files
	r.PathPrefix("/js/").Handler(http.FileServer(http.Dir("web/static")))
	r.PathPrefix("/css/").Handler(http.FileServer(http.Dir("web/static")))
	r.PathPrefix("/assets/").Handler(http.FileServer(http.Dir("web/static")))

	r.Handle("/favicon.ico", http.FileServer(http.Dir("web/static")))

	// register templates
	r.HandleFunc("/room", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "GET" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
		tmpl, err := template.ParseFiles("web/templates/room.html", "web/templates/head.html", "web/templates/header.html")
		if err != nil {
			http.Error(w, "Unexpected error occured", http.StatusInternalServerError)
		}
		tmpl.Execute(w, nil)
	})
	r.HandleFunc("/prejoin", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" {
			username := r.FormValue("username")
			log.Println(string(username))
			isSpectator := r.FormValue("isSpectator")
			log.Println(string(isSpectator))
			http.Redirect(w, r, "/room", http.StatusTemporaryRedirect)
		} else if r.Method == "GET" {
			data := struct {
				Title string
				Text  string
			}{
				Title: "Create a New Room",
				Text:  "create room",
			}
			create := r.URL.Query().Get("create")

			if create != "true" {
				data.Title = "Join a Room"
				data.Text = "join room"
			}
			tmpl, err := template.ParseFiles("web/templates/prejoin.html", "web/templates/head.html", "web/templates/header.html")
			if err != nil {
				log.Println(err)
			}
			err = tmpl.Execute(w, data)
			if err != nil {
				log.Println(err)
			}
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		tmpl, err := template.ParseFiles("web/templates/index.html", "web/templates/head.html", "web/templates/header.html")
		if err != nil {
			log.Println(err)
		}
		err = tmpl.Execute(w, nil)
		if err != nil {
			log.Println(err)
		}
	})
	// attachProfiler(r)

	// register api v1 Handlers
	apiRouter := r.PathPrefix("/api").Subrouter()
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

func registerTemplateHandlers(router *mux.Router) {

}
