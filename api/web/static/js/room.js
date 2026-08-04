import * as board from "./board.js";
import * as header from "./roomHeader.js";
import * as submitButton from "./submitButton.js";
import * as toast from "./toast.js";
import { labels } from "./scale.js";
import { navigate } from "./router.js";
import { getUsername, isSpectator, role, setSpectator } from "./state.js";

/**
 * A live room.
 *
 * All shared state lives on the server; this module holds only what it needs to
 * paint the page, and every change arrives as a websocket event.
 */

const PING_INTERVAL_MS = 5000;
const RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_ATTEMPTS = 5;

const STATUS = {
  Started: "Started",
  Revealable: "Revealable",
  Revealing: "Revealing",
  Revealed: "Revealed",
};

export function initRoom() {
  const root = document.querySelector(".room");
  if (!root) return;

  const roomId = root.dataset.roomId;
  const username = getUsername();

  // Arriving by a shared link, without ever having said who you are.
  if (!username) {
    navigate(`/prejoin?roomId=${encodeURIComponent(roomId)}`, { replace: true });
    return;
  }

  const state = {
    voters: [],
    spectators: [],
    status: STATUS.Started,
    sortOrder: "none",
    /** Revealed points, kept by username so they survive a voter list update. */
    points: new Map(),
    selectedCard: null,
    labels: labels(),
  };

  let socket = null;
  let ping = null;
  let reconnectTimer = null;
  let attempts = 0;
  let closed = false;

  const cardList = root.querySelector(".voting-card-list");
  const spectatorToggle = root.querySelector('input[name="isSpectator"]');
  const copyLink = root.querySelector("#copy-link");
  const toggleWrapper = root.querySelector("#spectator-toggle-wrapper");

  spectatorToggle.checked = isSpectator();

  // Connection ------------------------------------------------------------

  function send(message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }

  function connect() {
    const scheme = window.location.protocol === "https:" ? "wss:" : "ws:";
    const url =
      `${scheme}//${window.location.host}/v1/joinRoom/` +
      `${encodeURIComponent(roomId)}/${encodeURIComponent(username)}/${role()}`;

    socket = new WebSocket(url);

    socket.addEventListener("open", () => {
      attempts = 0;
      clearInterval(ping);
      ping = setInterval(() => send({ type: "ping" }), PING_INTERVAL_MS);
    });

    socket.addEventListener("message", (event) => handle(event.data));

    socket.addEventListener("close", () => {
      clearInterval(ping);
      if (closed) return;
      if (attempts >= MAX_RECONNECT_ATTEMPTS) {
        navigate("/", { replace: true });
        return;
      }
      attempts += 1;
      reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
    });
  }

  // Events from the server ------------------------------------------------

  function handle(raw) {
    let event;
    try {
      event = JSON.parse(raw);
    } catch (e) {
      console.error("unreadable message", raw, e);
      return;
    }

    switch (event.type) {
      case "usersUpdated":
        onUsersUpdated(event);
        break;
      case "userVoted":
        board.markVoted(event.username);
        break;
      case "roundRevealAvailable":
        setStatus(event.revealAvailable ? STATUS.Revealable : STATUS.Started);
        break;
      case "roundToReveal":
        state.revealingDuration = event.after;
        setStatus(STATUS.Revealing);
        break;
      case "cancelReveal":
        if (state.status === STATUS.Revealing) setStatus(STATUS.Revealable);
        break;
      case "roundRevealed":
        onRoundRevealed(event);
        break;
      case "roundStarted":
        onRoundStarted();
        break;
      case "pong":
        break;
      default:
        console.error("unhandled message", event);
    }
  }

  function onUsersUpdated(event) {
    const revealed = state.status === STATUS.Revealed;

    state.voters = event.users
      .filter((user) => user.isVoter)
      .map((user) => ({
        username: user.username,
        voted: user.hasVoted,
        points: state.points.get(user.username),
      }));
    state.spectators = event.users.filter((user) => !user.isVoter);

    board.renderVoters(orderedVoters(), { revealed, labels: state.labels });
    renderSpectators();
    renderSubmitButton();
  }

  function onRoundRevealed(event) {
    state.points = new Map(
      Object.entries(event.votes).map(([username, points]) => [username, points])
    );
    state.voters = state.voters.map((voter) => ({
      ...voter,
      points: state.points.get(voter.username),
    }));

    board.revealVotes(event.votes, state.labels);

    state.stats = event.stats;
    // Sorting on reveal groups the agreements together, which is where the
    // conversation usually starts. The status has to move first, because that
    // is what makes the ordering meaningful.
    state.sortOrder = "asc";
    state.status = STATUS.Revealed;
    board.reorder(orderedVoters().map((voter) => voter.username));

    setStatus(STATUS.Revealed);
  }

  function onRoundStarted() {
    state.points = new Map();
    state.voters = state.voters.map((voter) => ({
      ...voter,
      voted: false,
      points: undefined,
    }));
    state.stats = null;
    state.selectedCard = null;
    state.sortOrder = "none";

    clearSelection();
    board.clearVotes();
    setStatus(STATUS.Started);
  }

  // Painting --------------------------------------------------------------

  function orderedVoters() {
    if (state.sortOrder === "none" || state.status !== STATUS.Revealed) {
      return state.voters;
    }
    return board.sortVoters(state.voters, state.sortOrder);
  }

  function setStatus(status) {
    state.status = status;

    switch (status) {
      case STATUS.Started:
        header.showVoting();
        break;
      case STATUS.Revealable:
        header.showReady();
        break;
      case STATUS.Revealing:
        header.showRevealing(state.revealingDuration || 5000);
        break;
      case STATUS.Revealed:
        header.showRevealed(state.stats ?? {}, {
          sortOrder: state.sortOrder,
          onSort: onSortChanged,
        });
        break;
    }

    // Changing roles mid-reveal would move a vote out from under the round.
    const locked = status === STATUS.Revealing || status === STATUS.Revealed;
    spectatorToggle.disabled = locked;

    renderSubmitButton();
  }

  function onSortChanged(order) {
    state.sortOrder = order;
    header.markSort(order);
    board.reorder(orderedVoters().map((voter) => voter.username));
  }

  function renderSubmitButton() {
    submitButton.render(state.status, {
      spectator: isSpectator(),
      onAction: (action) => send({ type: action }),
    });
  }

  function renderSpectators() {
    const container = root.querySelector(".spectators");
    if (!container) return;
    if (state.spectators.length === 0) {
      container.replaceChildren();
      return;
    }

    const list = document.createElement("ul");
    list.className = "spectators";
    const heading = document.createElement("li");
    heading.textContent = "Spectators";
    list.appendChild(heading);

    state.spectators.forEach((spectator) => {
      const item = document.createElement("li");
      item.dataset.testid = `spectator-${spectator.username}`;
      item.textContent = spectator.username;
      list.appendChild(item);
    });

    container.replaceChildren(list);
  }

  function clearSelection() {
    cardList.querySelectorAll(".voting-card.selected").forEach((card) => {
      card.classList.remove("selected");
      const img = card.querySelector("img");
      if (img) img.src = "/static/assets/cup-small-black.svg";
    });
  }

  // Input -----------------------------------------------------------------

  function canVote() {
    return (
      !isSpectator() &&
      state.status !== STATUS.Revealing &&
      state.status !== STATUS.Revealed
    );
  }

  function onCardClick(event) {
    const card = event.target.closest(".voting-card");
    if (!card || !canVote()) return;

    const points = Number(card.dataset.value);
    if (state.selectedCard === points) return;

    clearSelection();
    card.classList.add("selected");
    const img = card.querySelector("img");
    if (img) img.src = "/static/assets/cup-small-white.svg";
    state.selectedCard = points;

    send({ type: "userToVote", username, storyPoints: points, roomId });
  }

  function onSpectatorToggled(event) {
    const spectator = event.target.checked;
    setSpectator(spectator);
    if (spectator) {
      state.selectedCard = null;
      clearSelection();
    }
    send({ type: "changeRole", username, role: spectator ? "spectator" : "voter" });
    renderSubmitButton();
  }

  function onToggleWrapperClick() {
    if (spectatorToggle.disabled) {
      toast.error("Can only change role after a new Round has Started");
    }
  }

  function onCopyLink() {
    navigator.clipboard?.writeText(window.location.href);
    toast.success("Link Copied");
  }

  function onKeyUp(event) {
    if (event.key === "Escape" && state.status === STATUS.Revealing) {
      send({ type: "cancelReveal" });
    }
  }

  cardList.addEventListener("click", onCardClick);
  spectatorToggle.addEventListener("change", onSpectatorToggled);
  toggleWrapper.addEventListener("click", onToggleWrapperClick);
  copyLink.addEventListener("click", onCopyLink);
  window.addEventListener("keyup", onKeyUp);

  connect();

  // Leaving the room has to hang up; otherwise the server keeps the visitor on
  // the board and the round can never become revealable again.
  return () => {
    closed = true;
    clearInterval(ping);
    clearTimeout(reconnectTimer);
    header.stop();
    window.removeEventListener("keyup", onKeyUp);
    socket?.close();
  };
}
