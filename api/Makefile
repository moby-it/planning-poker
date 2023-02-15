.PHONY: all clean build tidy test

run:
	go run main.go

build:
	go build -o bin/

test:
	go test ./... -v
	# staticcheck ./...

tidy:
	go mod tidy
	go mod vendor