.PHONY: all clean build tidy test

run: 
	go run main.go

build:
	rm -rf bin
	go build -o bin/

test:
	go test ./... -v

tidy:
	go mod tidy && go mod vendor