/**
 * @type {WebSocket}
 */
let socket;

function getTcp() {
  return window.location.protocol === 'https:' ? 'wss://' : 'ws://';
}
function wsUrl() {
  return getTcp() + window.location.host + '/api' + '/v1';
}
const username = localStorage.getItem("username") || "";
const role = localStorage.getItem("isSpectator") === "1" ? 'spectator' : 'voter';
const splitUrl = document.location.pathname.split("/");
const roomId = splitUrl[splitUrl.length - 1];
if (!username) {
  sessionStorage.setItem('roomId', roomId);
  window.location.href = `${window.origin}/prejoin`;
} else {
  socket = new WebSocket(
    `${wsUrl()}/joinRoom/${roomId}/${username}/${role}`
  );
  socket.addEventListener('open', () => {
    console.log('ws opened');
  });
  socket.addEventListener('error', (e) => {
    console.error('ws error', e);
    window.location.href = window.origin;
  });
  socket.addEventListener('message', handleWsMessage);
}

registeVoteEventHandler();
changeRoleEventListener();

function registeVoteEventHandler() {
  const votingCards = document.querySelectorAll('.voting-card');
  for (const votingCard of votingCards) {
    votingCard.addEventListener('click', () => {
      const existingVote = document.querySelector('.voting-card.selected');
      const newVote = votingCard.getAttribute('value');
      if (existingVote && existingVote.getAttribute('value') === newVote) return;
      existingVote?.classList.remove('selected');
      votingCard.classList.add('selected');

      const splitPath = window.location.pathname.split('/');
      const voteEvent = {
        type: "userToVote",
        username: localStorage.getItem('username'),
        storyPoints: +newVote,
        roomId: splitPath[splitPath.length - 1],
      };
      sendWsMessage(voteEvent);
    });
  }
}
function changeRoleEventListener() {
  const toggle = document.querySelector('input[name="isSpectator"]');
  toggle.addEventListener('change', (e) => {
    console.log(e.target.checked);
    if (typeof e.target.checked === 'boolean') {
      sendWsMessage({
        type: 'changeRole',
        username: localStorage.getItem('username'),
        role: e.target.checked ? 'spectator' : 'voter'
      });
    }
  });
}
function sendWsMessage(message) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}
