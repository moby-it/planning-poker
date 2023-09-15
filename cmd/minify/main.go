package main

import (
	"flag"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/tdewolff/minify/v2"
	"github.com/tdewolff/minify/v2/css"
	"github.com/tdewolff/minify/v2/html"
	"github.com/tdewolff/minify/v2/js"
	"github.com/tdewolff/minify/v2/svg"
)

func main() {
	// Parsing root directory from command-line arguments
	var rootDir string
	flag.StringVar(&rootDir, "root", "static", "Root directory for HTML, CSS, and JS files.")
	flag.Parse()

	if rootDir == "" {
		log.Fatalln("please pass a root directory")
	}
	m := minify.New()
	m.AddFunc("text/css", css.Minify)
	m.AddFunc("text/html", html.Minify)
	m.AddFunc("text/js", js.Minify)
	m.AddFunc("image/svg+xml", svg.Minify)
	m.AddFuncRegexp(regexp.MustCompile("^(application|text)/(x-)?(java|ecma)script$"), js.Minify)

	// // Minify HTML
	minifyFiles(rootDir, "templates", "html", m)

	// // Minify CSS
	minifyFiles(rootDir, "css", "css", m)

	// Minify JS
	minifyFiles(rootDir, "js", "js", m)
}

func minifyFiles(root, subDir string, fileType string, m *minify.M) {
	filepath.Walk(filepath.Join(root, subDir), func(path string, info os.FileInfo, err error) error {
		if err != nil {
			log.Fatalln(err)
		}

		if !info.IsDir() && strings.HasSuffix(info.Name(), fileType) {
			bytes, _ := os.ReadFile(path)
			minifiedBytes, _ := m.Bytes("text/"+fileType, bytes)
			os.WriteFile(path, minifiedBytes, info.Mode())
		}
		return nil
	})
}
