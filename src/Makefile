.PHONY: all clean build tidy test test-race

run: 
	go run main.go -race

build:
	rm -rf bin
	go build -race -o  bin/
	mkdir bin/web && cp -r web/static web/templates bin/web

test:
	go clean -testcache
	go test ./... -v

test-race:
	go clean -testcache
	go test ./... -v -race
tidy:
	go mod tidy && go mod vendor