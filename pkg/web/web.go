package web

import (
	"crypto/md5"
	"encoding/hex"
	"io"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/George-Spanos/poker-planning/pkg/web/endpoints"
	h "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

func Start() error {
	r := mux.NewRouter()

	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("app healthy"))
	}).Methods("GET")

	// register static files
	cacheDuration := 0 * time.Hour
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", fileServerWithCacheControl(http.Dir("static"), cacheDuration)))
	r.Handle("/favicon.ico", fileServerWithCacheControl(http.Dir("static"), cacheDuration))
	r.HandleFunc("/", endpoints.ServeHome).Methods("GET")
	r.HandleFunc("/room/{roomId}", endpoints.ServeRoom).Methods("GET")
	r.HandleFunc("/prejoin", endpoints.ServePrejoin).Methods("GET")

	apiRouter := r.PathPrefix("/api").Subrouter()
	v1Router := apiRouter.PathPrefix("/v1").Subrouter()
	v1Router.HandleFunc("/prejoin", endpoints.Prejoin).Methods("POST")
	v1Router.HandleFunc("/joinRoom/{roomId}/{username}/{role}", endpoints.ConnectToRoom)

	// attachProfiler(r)

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
func fileServerWithCacheControl(dir http.Dir, cacheDuration time.Duration) http.Handler {
	fs := http.FileServer(dir)
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get the file information
		file, err := dir.Open(r.URL.Path)
		if err != nil {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		defer file.Close()

		// Calculate ETag based on content hash and timestamp
		fileInfo, _ := file.Stat()
		contentHash := calculateContentHash(file)
		timestamp := fileInfo.ModTime().Unix()
		etag := "\"" + contentHash + "-" + strconv.FormatInt(timestamp, 10) + "\""

		// Check if the client's ETag matches the resource's ETag
		if match := r.Header.Get("If-None-Match"); match != "" {
			if match == etag {
				w.WriteHeader(http.StatusNotModified)
				return
			}
		}

		// Set Cache-Control and ETag headers
		w.Header().Set("Cache-Control", "max-age="+strconv.Itoa(int(cacheDuration.Seconds())))
		w.Header().Set("ETag", etag)

		// Serve the file using the standard file server
		fs.ServeHTTP(w, r)
	})
}

func calculateContentHash(file http.File) string {
	hash := md5.New()
	_, err := io.Copy(hash, file)
	if err != nil {
		return ""
	}
	return hex.EncodeToString(hash.Sum(nil))
}

// func attachProfiler(router *mux.Router) {
// 	router.HandleFunc("/debug/pprof/", pprof.Index)
// 	router.HandleFunc("/debug/pprof/cmdline", pprof.Cmdline)
// 	router.HandleFunc("/debug/pprof/profile", pprof.Profile)
// 	router.HandleFunc("/debug/pprof/symbol", pprof.Symbol)
// 	router.HandleFunc("/debug/pprof/trace", pprof.Trace)
// }
