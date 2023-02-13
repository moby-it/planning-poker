package web

import "github.com/gorilla/websocket"

type Client struct {
	id         string
	roomId     string
	username   string
	connection *websocket.Conn
}

var Clients = make(map[string]*Client)
