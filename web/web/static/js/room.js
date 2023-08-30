
function getTcp() {
  return window.location.protocol === 'https:' ? 'wss://' : 'ws://';
}
function wsUrl() {
  return getTcp() + window.location.host + '/api' + '/v1';
}
const username = localStorage.getItem("username") || "";
const role = localStorage.getItem("isSpectator") ? 'spectator' : 'voter';
const splitUrl = document.location.pathname.split("/");
const roomId = splitUrl[splitUrl.length - 1];
if (!username) {
  sessionStorage.setItem('roomId', roomId);
  window.location.href = `${window.origin}/prejoin`;
} else {
  const socket = new WebSocket(
    `${wsUrl()}/joinRoom/${roomId}/${username}/${role}`
  );
  socket.addEventListener('open', () => {
    console.log('ws opened');
  });
  socket.addEventListener('error', (e) => {
    console.error('ws error', e);
  });
  socket.addEventListener('message', (e) => {
    console.log('new ws message', e);
  });
}