package core

import "github.com/gorilla/websocket"

type Client struct {
	roomId     string
	username   string
	connection *websocket.Conn
}

var Clients = make(map[string]*Client)
