FROM golang:1.20.6-alpine as build
WORKDIR /app
COPY ./ ./
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1
EXPOSE 8080
RUN go build -o bin/
CMD [ "bin/poker-planning" ]
