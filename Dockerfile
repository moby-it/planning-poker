FROM golang:1.21.1-alpine as build
WORKDIR /app
COPY ./ ./
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1
EXPOSE 8080
RUN go build -o bin/poker-planning cmd/main.go
CMD [ "bin/poker-planning" ]
