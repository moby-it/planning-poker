FROM golang:1.21.1-alpine as build
WORKDIR /app
COPY cmd ./cmd
COPY pkg ./pkg
COPY static ./static
COPY vendor ./vendor
COPY go.mod go.sum ./
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1
EXPOSE 8080

RUN go build -o bin/poker-planning cmd/web/main.go
COPY static bin/static
RUN go run cmd/minify/main.go --root=bin/static

FROM scratch

WORKDIR /app`
COPY --from=build /app/bin .

CMD [ "./poker-planning" ]