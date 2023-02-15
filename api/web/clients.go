package web

import "github.com/gorilla/websocket"

type Client struct {
	Id         string
	RoomId     string
	Username   string
	Connection *websocket.Conn
}

var Clients = make(map[string]*Client)
