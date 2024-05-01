import { registerSpectatorInputEventListener, } from "./isSpectatorToggle.js";
import { sendWsMessage } from './room.js';
import { renderHeader } from './render.js';
import store from './store.js';


let headerInterval;
let revealInterval;

registerSpectatorInputEventListener();

function getSubmitButton() {
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
      store.users = [...data.users];
      break;
    case 'roundRevealAvailable':
      store.roundStatus = data.revealAvailable ? 'revealable' : null;
      break;
    case 'userVoted':
      const vote = document.querySelector(`[data-testid='board-card-${data.username}'] > .card`);
      vote.classList.add('voted');
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
      store.votes = [];
      store.roundStatus = 'started';
      break;
    case 'pong':
    // ignore
  }
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
  renderHeader('Average Story Points ' + average);
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
  renderHeader(`Revealing in ${after / 1000}`);
  let remainingTime = after - 1000;
  headerInterval = setInterval(() => {
    if (remainingTime < 0) {
      clearInterval(headerInterval);
      return;
    }
    const headerText = `Revealing in ${remainingTime / 1000}`;
    remainingTime = remainingTime - 1000;
    if (remainingTime > 0)
      renderHeader(headerText);
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
  renderHeader("Everyone's Ready"); function addVoter(voter) {
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
}
function handleRoundToStart() {
  sendWsMessage({ type: 'roundToStart' });
}
function cancelRevealHandler() {
  sendWsMessage({ type: 'cancelReveal' });
}

