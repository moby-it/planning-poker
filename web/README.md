# Poker Planning API

This is the web api layer of the poker planning app, written in [Go](https://go.dev/). 

- There is no database layer, everything is stored in memory.
- The api is not horizontaly scalable for the above reason.
- We used [gorilla/websocket](https://github.com/gorilla/websocket) for the websocket implementation and [gorilla/mux](https://github.com/gorilla/mux) as the http multiplexer.

