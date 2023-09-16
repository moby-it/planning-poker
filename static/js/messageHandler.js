import { registerSpectatorInputEventListener, role } from "/static/js/isSpectatorToggle.js";
import { sendWsMessage } from '/static/js/room.js';

let headerInterval;
let revealInterval;

registerSpectatorInputEventListener();

function getSubmitButton() {
  return document.querySelector('#submit-btn');
}

export function handleWsMessage(message) {
  let data = message.data;
  try {
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
  const board = document.querySelector('.board');
  if (!board) throw new Error('no board element. cannot update users');
  while (board.children.length > 0) board.removeChild(board.lastChild);
  const spectatorsList = document.querySelector('ul.spectators');
  while (spectatorsList.children.length >= 2) spectatorsList.removeChild(spectatorsList.lastChild);
  users.forEach(user => user.isVoter ? addVoter(user) : addSpectator(user));
}

function addVoter(voter) {
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
function updateUserVoted(username) {
  const vote = document.querySelector(`[data-testid='board-card-${username}'] > .card`);
  vote.classList.add('voted');
}
function resetRound() {
  document.querySelectorAll('.card.voted').forEach(e => e.classList.remove('voted'));
  document.querySelector('.voting-card.selected')?.classList.remove('selected');
  document.querySelectorAll('.reveal').forEach(e => e.removeChild(e.lastChild));
  document.querySelector('#progress-bar').style.display = 'none';
  document.querySelector('.btn.primary')?.remove();
  setHeader("Everyone's Ready");
}
function revealRound(votes) {
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
  dispatchRevealingEvent(false);
}
function roundToReveal(after) {
  dispatchRevealingEvent(true);
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
  setHeader("Everyone's Ready");
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