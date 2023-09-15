.PHONY: all clean build tidy test test-race

run: 
	go run cmd/web/main.go -race

minify:
	echo "minifying static files..."
	go run cmd/minify/main.go --root=bin/static
	echo "Static files minified"

build-web:
	rm -rf bin
	go build -o bin/ cmd/web/main.go
	cp -r static bin/static
	echo "Web app built"

build: build-web minify 
	echo "Build complete"

test:
	go clean -testcache
	go test ./... -v

test-race:
	go clean -testcache
	go test ./... -v -race
tidy:
	go mod tidy && go mod vendor