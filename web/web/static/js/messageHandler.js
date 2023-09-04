function handleWsMessage(message) {
  let data = message.data;
  try {
    data = JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  switch (data.type) {
    case 'usersUpdated':
      console.log("update users Updated", data.users);
      updateUsers(data.users);
      break;
    case 'roundRevealAvailable':
      console.log("round reaveal avaiable", data.revealAvailable);
      updateRoundIsRevealable(data.revealAvailable);
      break;
    case 'userVoted':
      console.log('user voted', data.username);
      updateUserVoted(data.username);
      break;
    case 'roundToReveal':
      console.log('round to reveal after', data.after);
      roundToReveal(data.after);
      break;
    case 'cancelReveal':
      console.log('cancel reveal');
      break;
    case 'roundRevealed':
      console.log('round revealed', data.votes);
      revealRound(data.votes);
      break;
    case 'roundStarted':
      console.log('round started');
      resetRound();
      break;
    case 'pong':
    // ignore
  }
}

function updateUsers(users) {
  const board = document.querySelector('.board');
  while (board.children.length > 0) board.removeChild(board.lastChild);
  const spectatorsList = document.querySelector('ul.spectators');
  while (spectatorsList.children.length >= 2) spectatorsList.removeChild(spectatorsList.lastChild);
  for (const user of users) {
    if (user.isVoter) {
      addVoter(user);
    } else {
      addSpectator(user);
    }
  }
}

function addVoter(voter) {
  const board = document.querySelector('.board');
  const voteCard = document.createElement('div');
  voteCard.classList.add('vote');
  voteCard.setAttribute('data-testid', `board-card-${voter.username}`);
  const card = document.createElement('div');
  card.classList.add('card');
  voteCard.appendChild(card);
  const usernameText = document.createElement('span');
  usernameText.innerText = voter.username;
  voteCard.appendChild(usernameText);
  board.appendChild(voteCard);
}
function addSpectator(spectator) {
  const spectatorsList = document.querySelector('ul.spectators');
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
  document.querySelector('.voting-card.selected').classList.remove('selected');
  document.querySelectorAll('.reveal').forEach(e => e.removeChild(e.lastChild));
  document.querySelector('#progress-bar').style.display = 'none';
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
  // change button
  const submitButton = document.querySelector('.btn.primary');
  submitButton.innerText = "Start New Round";
  submitButton.removeEventListener('click', handleRevealSubmit);
  submitButton.addEventListener('click', handleRoundToStart);
}
function roundToReveal(after) {
  // add progress bar
  const progressBar = document.querySelector('#progress-bar');
  if (progressBar) progressBar.style.display = 'block';
  if (!after) after = 5000;
  let width = 1;
  let i = 1;
  const intervalTime = 10;
  const interval = setInterval(() => {
    if (width >= 100) clearInterval(interval);
    width = ((i * intervalTime) / after) * 100;
    document.querySelector('#progress-bar #bar').style.width = width + '%';
    i++;
  }, intervalTime);

  // set room header
  setHeader(`Revealing in ${after / 1000}`);
  let remainingTime = after - 1000;
  const headerInterval = setInterval(() => {
    if (remainingTime < 0) {
      clearInterval(headerInterval);
      return;
    }
    const headerText = `Revealing in ${remainingTime / 1000}`;
    remainingTime = remainingTime - 1000;
    if (remainingTime > 0)
      setHeader(headerText);
  }, 1000);

}
function updateRoundIsRevealable(revealAvailable) {
  let submitButton = document.querySelector('.btn.primary');
  if (revealAvailable && !submitButton) {
    submitButton = document.createElement('button');
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
function handleRevealSubmit() {
  sendWsMessage({ type: 'roundToReveal' });
}
function handleRoundToStart() {
  sendWsMessage({ type: 'roundToStart' });
}
function setHeader(header) {
  const headerText = document.querySelector('.room-header > h2');
  headerText.innerText = header;
}