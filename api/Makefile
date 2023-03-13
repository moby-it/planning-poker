.PHONY: all clean build tidy test

run: 
	go run main.go -race

build:
	rm -rf bin
	go build -o bin/

test:
	go test ./... -v -race

tidy:
	go mod tidy && go mod vendor