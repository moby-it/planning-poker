package endpoints

import "fmt"

func addPrefix(templates []string) []string {
	prefix := "static/templates"
	files := make([]string, len(templates))
	for i := range templates {
		files[i] = fmt.Sprintf("%s/%s", prefix, templates[i])
	}
	return files
}