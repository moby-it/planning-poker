const interval = 5000;
document.addEventListener('htmx:wsOpen', (e) => {
  /**
   * @type {WebSocket}
   */
  const websocket = e.detail.event.target;
  setInterval(() => { websocket.send(9); }, interval);
});