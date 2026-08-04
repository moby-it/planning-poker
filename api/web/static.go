package web

import (
	"crypto/md5"
	"embed"
	"encoding/hex"
	"io"
	"io/fs"
	"net/http"
	"strconv"
	"time"
)

//go:embed static
var staticFiles embed.FS

// staticHandler serves the embedded stylesheets, scripts and images.
//
// Embedded files all share the build's timestamp, so the ETag is derived from
// the content itself: a rebuild that leaves a file untouched keeps serving 304s.
func staticHandler(cacheFor time.Duration) http.Handler {
	root, err := fs.Sub(staticFiles, "static")
	if err != nil {
		panic("web: static assets missing: " + err.Error())
	}
	fileServer := http.FileServer(http.FS(root))

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		etag, err := contentETag(root, r.URL.Path)
		if err != nil {
			http.NotFound(w, r)
			return
		}

		if r.Header.Get("If-None-Match") == etag {
			w.WriteHeader(http.StatusNotModified)
			return
		}

		w.Header().Set("ETag", etag)
		w.Header().Set("Cache-Control", "max-age="+strconv.Itoa(int(cacheFor.Seconds())))
		fileServer.ServeHTTP(w, r)
	})
}

func contentETag(root fs.FS, path string) (string, error) {
	name := path
	for len(name) > 0 && name[0] == '/' {
		name = name[1:]
	}
	if name == "" {
		name = "."
	}

	file, err := root.Open(name)
	if err != nil {
		return "", err
	}
	defer file.Close()

	hash := md5.New()
	if _, err := io.Copy(hash, file); err != nil {
		return "", err
	}
	return `"` + hex.EncodeToString(hash.Sum(nil)) + `"`, nil
}
