import { registerSpectatorInputEventListener, role } from "/static/js/isSpectatorToggle.js";
import { sendWsMessage } from '/static/js/room.js';
import store from './store.js';

import { html, render } from 'https://unpkg.com/lit-html?module';

let headerInterval;
let revealInterval;

registerSpectatorInputEventListener();

window.addEventListener("planningupdate", () => {
  renderBoard();
  if (store.prevRoundStatus === 'revealed' && store.roundStatus === 'started') renderRoundReset();
});

function getSubmitButton() {
  return document.querySelector('#submit-btn');
}

export function handleWsMessage(message) {
  let data = message.data;
  try {
    this;
    data = JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  switch (data.type) {
    case 'usersUpdated':
      updateUsers(data.users);
      break;
    case 'roundRevealAvailable':
      updateRoundIsRevealable(data.revealAvailable);
      break;
    case 'userVoted':
      updateUserVoted(data.username);
      break;
    case 'roundToReveal':
      roundToReveal(data.after);
      break;
    case 'cancelReveal':
      cancelReveal();
      break;
    case 'roundRevealed':
      revealRound(data.votes);
      break;
    case 'roundStarted':
      resetRound();
      break;
    case 'pong':
    // ignore
  }
}

function updateUsers(users) {
  store.users = [...users];
}
function updateUserVoted(username) {
  const vote = document.querySelector(`[data-testid='board-card-${username}'] > .card`);
  vote.classList.add('voted');
}
function resetRound() {
  store.votes = [];
  store.roundStatus = 'started';
}
function revealRound(votes) {
  store.votes = [...votes];
  store.roundStatus = 'revealed';
  document.querySelectorAll('.card.voted').forEach(e => e.classList.remove('voted'));
  for (const [username, pointsVoted] of Object.entries(votes)) {
    const vote = document.querySelector(`[data-testid='board-card-${username}'] > .card`);
    const storyPoints = document.createElement('span');
    storyPoints.innerText = pointsVoted;
    vote.appendChild(storyPoints);
  }
  // show average
  const voteSum = Object.values(votes).reduce((prev, curr) => prev + curr);
  const average = voteSum / Object.keys(votes).length;
  setHeader('Average Story Points ' + average);
  // change buttonrevealInterval
  const submitButton = getSubmitButton();
  if (submitButton) {
    submitButton.innerText = "Start New Round";
    submitButton.classList.remove('default');
    submitButton.classList.add('primary');
    submitButton.setAttribute('data-testid', 'start-new-round');
    submitButton.removeEventListener('click', cancelRevealHandler);
    submitButton.addEventListener('click', handleRoundToStart);
  }
}
function roundToReveal(after) {
  store.roundStatus = 'revealing';
  // add progress bar
  const progressBar = document.querySelector('#progress-bar');
  if (progressBar) progressBar.style.display = 'block';
  if (!after) after = 5000;
  let width = 1;
  let i = 1;
  const intervalTime = 10;
  revealInterval = setInterval(() => {
    if (width >= 100) clearInterval(revealInterval);
    width = ((i * intervalTime) / after) * 100;
    document.querySelector('#progress-bar #bar').style.width = width + '%';
    i++;
  }, intervalTime);

  // set room header
  setHeader(`Revealing in ${after / 1000}`);
  let remainingTime = after - 1000;
  headerInterval = setInterval(() => {
    if (remainingTime < 0) {
      clearInterval(headerInterval);
      return;
    }
    const headerText = `Revealing in ${remainingTime / 1000}`;
    remainingTime = remainingTime - 1000;
    if (remainingTime > 0)
      setHeader(headerText);
  }, 1000);
  // set cancel button
  const submitButton = getSubmitButton();
  if (submitButton) {
    submitButton.innerText = 'Cancel Reveal';
    submitButton.classList.remove('primary');
    submitButton.classList.add('default');
    submitButton.setAttribute('data-testid', 'cancel-reveal');
    submitButton.removeEventListener('click', handleRevealSubmit);
    submitButton.addEventListener('click', cancelRevealHandler);
  }
}
function updateRoundIsRevealable(revealAvailable) {
  if (revealAvailable) {
    store.roundStatus = 'revealable';
  }
  else {
    store.roundStatus = 'started';
  }
  let submitButton = getSubmitButton();
  if (role() === 'spectator') {
    submitButton?.remove();
    return;
  }
  if (revealAvailable && !submitButton) {
    submitButton = document.createElement('button');
    submitButton.id = 'submit-btn';
    submitButton.classList.add('btn', 'primary');
    submitButton.setAttribute('data-testid', 'reveal-round');
    submitButton.innerText = "Reveal Cards";
    submitButton.removeEventListener('click', handleRoundToStart);
    submitButton.addEventListener('click', handleRevealSubmit);
    const board = document.querySelector('.board');
    board.parentNode.insertBefore(submitButton, board.nextSibling);
  }
  if (!revealAvailable && submitButton) submitButton.remove();
}
function cancelReveal() {
  store.roundStatus = 'started';
  clearInterval(headerInterval);
  headerInterval = null;
  clearInterval(revealInterval);
  revealInterval = null;
  const progressBar = document.querySelector('#progress-bar');
  if (progressBar) progressBar.style.display = 'none';
  const submitButton = getSubmitButton();
  if (submitButton) {
    submitButton.removeEventListener('click', cancelRevealHandler);
    submitButton.addEventListener('click', handleRevealSubmit);
    submitButton.innerText = 'Reveal Cards';
    submitButton.classList.remove('default');
    submitButton.classList.add('primary');
    submitButton.setAttribute('data-testid', 'reveal-round');
  }
  setHeader("Everyone's Ready"); function addVoter(voter) {
    const board = document.querySelector('.board');
    const voteCard = document.createElement('div');
    voteCard.classList.add('vote');
    voteCard.setAttribute('data-testid', `board-card-${voter.username}`);
    const card = document.createElement('div');
    card.classList.add('card');
    if (voter.hasVoted) card.classList.add('voted');
    voteCard.appendChild(card);
    const usernameText = document.createElement('span');
    usernameText.innerText = voter.username;
    voteCard.appendChild(usernameText);
    board.appendChild(voteCard);
  }
  function addSpectator(spectator) {
    const spectatorsList = document.querySelector('ul.spectators');
    if (!spectatorsList) throw new Error('cannot add spectator. no spectator list found');
    const newSpectator = document.createElement('li');
    newSpectator.innerText = spectator.username;
    spectatorsList.appendChild(newSpectator);
  }
  dispatchRevealingEvent(false);
}
function handleRevealSubmit() {
  if (!revealInterval || revealInterval) {
    sendWsMessage({ type: 'roundToReveal' });
  }
}
function handleRoundToStart() {
  sendWsMessage({ type: 'roundToStart' });
}
function cancelRevealHandler() {
  sendWsMessage({ type: 'cancelReveal' });
}
function setHeader(header) {
  const headerText = document.querySelector('.room-header > h2');
  headerText.innerText = header;
}
function dispatchRevealingEvent(revealing) {
  const event = new CustomEvent('revealing', { detail: revealing });
  document.dispatchEvent(event);
}

function renderBoard() {
  const board = document.querySelector('.board');
  const voters = html`${store.users.filter(u => u.isVoter).map(u =>
    renderVoter(u)
  )}`;
  render(voters, board);
  const spectatorsList = document.querySelector('ul.spectators');
  const spectators = html`
  <ul class="spectators">
    ${store.users.filter(u => !u.isVoter).map(s => html`<li>${s.username}</li>`)}
  </ul>`;
  render(spectators, spectatorsList);
}
function renderVoter(user) {
  const classes = `card`;
  if (user.hasVoted) card += ` voted`;
  return html`
  <div class="vote" data-testid="board-card-${user.username}">
    <div class="${classes}"></div>
      <span class="username">${user.username}</span>
    </div>`;
};
function renderRoundReset() {
  document.querySelectorAll('.card.voted').forEach(e => e.classList.remove('voted'));
  document.querySelector('.voting-card.selected')?.classList.remove('selected');
  document.querySelectorAll('.reveal').forEach(e => e.removeChild(e.lastChild));
  document.querySelector('#progress-bar').style.display = 'none';
  document.querySelector('.btn.primary')?.remove();
  setHeader("Everyone's Ready");
}