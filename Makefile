.PHONY: all clean build tidy test test-race

run: 
	go run cmd/main.go -race

build:
	rm -rf bin
	go build -o bin/ cmd/main.go 
	mkdir bin/static && cp -r static bin/static

test:
	go clean -testcache
	go test ./... -v

test-race:
	go clean -testcache
	go test ./... -v -race
tidy:
	go mod tidy && go mod vendor