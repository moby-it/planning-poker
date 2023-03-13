.PHONY: all clean build tidy test test-race

run: 
	go run main.go -race

build:
	rm -rf bin
	go build -race -o  bin/

test:
	go clean -testcache
	go test ./... -v

test-race:
	go clean -testcache
	go test ./... -v -race
tidy:
	go mod tidy && go mod vendor