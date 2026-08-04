package web

import (
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/George-Spanos/poker-planning/web/handlers"
	"github.com/gorilla/mux"
)

// staticCacheDuration is deliberately short: the asset URLs are not
// fingerprinted, so a long cache would pin visitors to an old build. The ETag
// keeps the repeat requests cheap.
const staticCacheDuration = 5 * time.Minute

// Router wires up every route the app serves: the HTML pages, the embedded
// assets, and the v1 API the browser talks to over HTTP and websockets.
func Router() *mux.Router {
	r := mux.NewRouter()

	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("app healthy"))
	}).Methods("GET")

	// Pages
	r.HandleFunc("/", handlers.ServeHome).Methods("GET")
	r.HandleFunc("/prejoin", handlers.ServePrejoin).Methods("GET")
	r.HandleFunc("/room/{roomId}", handlers.ServeRoom).Methods("GET")

	// Assets
	assets := staticHandler(staticCacheDuration)
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", assets))
	// Browsers ask for /favicon.ico whether or not the page links to it.
	r.Handle("/favicon.ico",
		http.RedirectHandler("/static/assets/favicon.ico", http.StatusMovedPermanently)).Methods("GET")

	// v1 Handlers
	v1Router := r.PathPrefix("/v1").Subrouter()
	v1Router.HandleFunc("/createRoom", handlers.CreateRoom).Methods("POST")
	v1Router.HandleFunc("/joinRoom/{roomId}/{username}/{role}", handlers.ConnectToRoom)

	r.NotFoundHandler = http.HandlerFunc(notFound)

	return r
}

// notFound sends a visitor who mistyped a URL back to the home page, but lets
// anything else fail honestly. Redirecting a missing script or stylesheet would
// answer it with a page of HTML, which the browser then tries to parse as code.
func notFound(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet && strings.Contains(r.Header.Get("Accept"), "text/html") {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}
	http.NotFound(w, r)
}

func StartApp() error {
	srv := &http.Server{
		Handler: Router(),
		Addr:    "0.0.0.0:8080",
		// No WriteTimeout: the app serves long-lived websocket connections and
		// a deadline set before the hijack would cut them off.
		ReadHeaderTimeout: 10 * time.Second,
	}
	log.Println("Listening on port 8080")
	return srv.ListenAndServe()
}
