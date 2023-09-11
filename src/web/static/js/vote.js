const searchParams = new URLSearchParams(window.location.search);
const username = searchParams.get('username');
if (!username) {
  console.warn("no username. cannot send messages");
  window.location.href = "/";
}
document.addEventListener('htmx:wsOpen', (e) => {
  /**
   * @type {WebSocket}
   */
  const websocket = e.detail.event.target;
  const votingCards = document.querySelectorAll('.voting-card');
  for (const votingCard of votingCards) {
    votingCard.addEventListener('click', (e) => {
      const storyPoints = +votingCard.getAttribute('value');
      websocket.send(JSON.stringify({ type: "userToVote", username, storyPoints }));
      const votedCard = document.querySelector('.selected');
      if (votedCard) votedCard.classList.remove('selected');
      votingCard.classList.add('selected');
    });
  }
});