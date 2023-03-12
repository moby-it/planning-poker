FROM golang:1.20.2-alpine as build-api
WORKDIR /app
COPY ./ ./
RUN go build -o bin/
CMD [ "bin/poker-planning" ]
