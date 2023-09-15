# !/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e
# Exit if any command in a pipeline fails
set -o pipefail

# Path variables
BIN_DIR="bin"
STATIC_DIR="static"
MAIN_GO="cmd/web/main.go"
MINIFY_GO="cmd/minify/main.go"

# Check if 'go' and 'cp' commands exist
if ! command -v go &> /dev/null || ! command -v cp &> /dev/null; then
    echo "Required commands are missing!"
    exit 1
fi

# Log messages for traceability
log() {
    echo "[INFO] $1"
}

log "Deleting old bin folder"
rm -rf $BIN_DIR

log "Building go web app"
go build -o $BIN_DIR/poker-planning $MAIN_GO

log "Web app built"

log "Copying static files"
cp -r $STATIC_DIR $BIN_DIR/$STATIC_DIR

log "Minifying static files"
go run $MINIFY_GO --root $BIN_DIR/$STATIC_DIR

log "Static files minified"