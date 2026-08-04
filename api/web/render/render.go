// Package render turns the embedded templates into HTML responses.
//
// Every page is parsed against the shared layout at startup, so a broken
// template fails the process immediately instead of on the first request.
package render

import (
	"bytes"
	"embed"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"strings"
)

//go:embed templates
var files embed.FS

// Letter is one character of a heading, carrying its position so the CSS can
// stagger the entrance animation without any JavaScript.
type Letter struct {
	Index int
	Char  string
	Space bool
}

// Letters splits s for the staggered title animation. Spaces are kept as plain
// characters so the heading still reads as words to anything that scrapes it.
func Letters(s string) []Letter {
	letters := make([]Letter, 0, len(s))
	for i, r := range []rune(s) {
		letters = append(letters, Letter{Index: i, Char: string(r), Space: r == ' '})
	}
	return letters
}

// Toggle is the data a switch needs. It exists so templates can build one
// inline without an untyped dictionary helper.
type Toggle struct {
	Name   string
	Label  string
	TestId string
}

var funcs = template.FuncMap{
	"letters": Letters,
	"toggle": func(name, label, testID string) Toggle {
		return Toggle{Name: name, Label: label, TestId: testID}
	},
	// styleIndex hands the letter's position to CSS as a custom property.
	// It is declared as template.CSS because the escaper cannot tell that a
	// custom property is safe on its own.
	"styleIndex": func(i int) template.CSS {
		return template.CSS(fmt.Sprintf("--i:%d", i))
	},
}

// pages are the full documents that can be served. Each is the layout plus
// every partial plus that page's own body.
var pages = map[string]*template.Template{}

func init() {
	names, err := templateNames()
	if err != nil {
		log.Fatalf("render: %v", err)
	}
	for _, name := range names {
		pages[name] = template.Must(
			template.New("layout.html").
				Funcs(funcs).
				ParseFS(files,
					"templates/layout.html",
					"templates/partials/*.html",
					"templates/pages/"+name+".html",
				),
		)
	}
}

func templateNames() ([]string, error) {
	entries, err := files.ReadDir("templates/pages")
	if err != nil {
		return nil, err
	}
	names := make([]string, 0, len(entries))
	for _, entry := range entries {
		names = append(names, strings.TrimSuffix(entry.Name(), ".html"))
	}
	return names, nil
}

// Page writes the named page. It renders into a buffer first so a template
// error surfaces as a 500 rather than as half a page the browser has already
// started parsing.
func Page(w http.ResponseWriter, name string, data any) {
	tmpl, found := pages[name]
	if !found {
		log.Printf("render: unknown page %q", name)
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		log.Printf("render: executing %q: %v", name, err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Content-Length", fmt.Sprint(buf.Len()))
	// Pages are assembled per request and the client router refetches them on
	// every navigation; caching them would serve a stale room.
	w.Header().Set("Cache-Control", "no-store")
	buf.WriteTo(w)
}
