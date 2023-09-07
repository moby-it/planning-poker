/**
 * @type {WebSocket}
 */
let socket;
let revealing;
document.addEventListener('revealing', (e) => {
  document.querySelector('input[name="isSpectator"]').disabled = e.detail;
  revealing = e.detail;
});
import { handleWsMessage } from '/js/messageHandler.js';

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
  connectToWs()();
}

registeVoteEventHandler();
changeRoleEventListener();

function registeVoteEventHandler() {
  const votingCards = document.querySelectorAll('.voting-card');
  for (const votingCard of votingCards) {
    votingCard.addEventListener('click', () => {
      if (revealing) return;
      const existingVote = document.querySelector('.voting-card.selected');
      const newVote = votingCard.getAttribute('value');
      const isSpectator = localStorage.getItem('isSpectator');
      if (parseInt(isSpectator) === 1) return;
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
      localStorage.setItem('isSpectator', e.target.checked ? '1' : '0');
      sendWsMessage({
        type: 'changeRole',
        username: localStorage.getItem('username'),
        role: e.target.checked ? 'spectator' : 'voter'
      });
    }
  });
}
export function sendWsMessage(message) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}
function connectToWs(retries = 0) {
  return () => {
    socket = new WebSocket(
      `${wsUrl()}/joinRoom/${roomId}/${username}/${role}`
    );
    socket.addEventListener('open', () => {
      retries = 0;
      socket.addEventListener('message', handleWsMessage);
      console.log('ws opened');
      setInterval(() => {
        sendWsMessage({ type: 'ping' });
      }, 5000);
    });
    socket.addEventListener('error', (e) => {
      console.error('ws error', e);
      if (retries < 10) {
        retries++;
        setTimeout(connectToWs(retries), 1000);
      } else {
        window.location.href = window.origin;
      }
    });
  };
}