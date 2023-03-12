package main

import (
	"log"

	"github.com/George-Spanos/poker-planning/web"
)

func main() {
	err := web.StartApp()
	if err != nil {
		log.Fatalln(err)
	}
}
