package handlers

import "fmt"

func AddPrefix(templates []string) []string {
	prefix := "web/static/templates"
	files := make([]string, len(templates))
	for i := range templates {
		files[i] = fmt.Sprintf("%s/%s", prefix, templates[i])
	}
	return files
}
