import store from './store.js';
import { sendWsMessage } from './room.js';
import { html, render } from "https://esm.sh/lit-html@3.1.3";

export function renderBoard() {
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
export function renderRoundReset() {
  document.querySelectorAll('.card.voted').forEach(e => e.classList.remove('voted'));
  document.querySelector('.voting-card.selected')?.classList.remove('selected');
  document.querySelectorAll('.reveal').forEach(e => e.removeChild(e.lastChild));
  document.querySelector('#progress-bar').style.display = 'none';
  document.querySelector('.btn.primary')?.remove();
  renderHeader("Everyone's Ready");
}
export function renderHeader(header) {
  const headerText = document.querySelector('.room-header > h2');
  headerText.innerText = header;
}
export function renderSubmitButton() {
  let submitButtonWrapper = document.querySelector('#submit-btn-wrapper');
  if (store.role === 'spectator' || !store.isRevealable()) {
    submitButtonWrapper.innerHTML = '';
    return;
  }

  render(createSubmitButton(store.roundStatus), submitButtonWrapper);
}

function handleRevealSubmit() {
  sendWsMessage({ type: 'roundToReveal' });
}
function cancelRevealHandler() {
  sendWsMessage({ type: 'cancelReveal' });
}
const createSubmitButton = (roundStatus) => {
  if (roundStatus === 'revealable') return html`
  <button id="submit-btn" class="btn primary" data-testid="reveal-round" @click=${handleRevealSubmit}>Reveal Cards</button>
  `;
  if (roundStatus === 'revealing') return html`
  <button id="submit-btn" class="btn default" data-testid="cancel-reveal" @click=${cancelRevealHandler}>Cancel Reveal</button>
  `;
  return html`<button id="submit-btn" class="hidden"></button>`;
};