import { registerSpectatorInputEventListener, isSpectatorInput } from "/static/js/isSpectatorToggle.js";

registerSpectatorInputEventListener();

const usernameInput = document.querySelector('input[name="username"]');
const submit = document.querySelector('#submit');
const apiUrl = window.location.origin + "/api/v1";
const localStorageKeys = {
  username: 'username',
  isSpectator: 'isSpectator',
};
const existingUsername = localStorage.getItem(localStorageKeys.username);
if (existingUsername) usernameInput.value = existingUsername;
// validate user input changes and save to local storage
if (usernameInput) {
  usernameInput.addEventListener('input', (e) => {
    const username = e.target.value;
    const errorNode = document.querySelector('.error');
    if (username.length > 12) {
      if (errorNode) return;
      const error = document.createElement('span');
      error.classList.add('error');
      const errorText = document.createTextNode('Username must be less than 12 characters');
      error.appendChild(errorText);
      e.target.parentNode.appendChild(error);
      submit.disabled = true;
      localStorage.removeItem(localStorageKeys.username);
    } else {
      const errorNode = document.querySelector('.error');
      errorNode?.remove();
      submit.disabled = false;
      localStorage.setItem(localStorageKeys.username, username);
    }
  });
} else {
  console.error('username input not found');
}

// register submit handler
if (submit) {
  submit.addEventListener('click', () => {
    const username = usernameInput.value;
    const isSpectator = isSpectatorInput.checked;
    const role = isSpectator ? 'spectator' : 'voter';
    const url = new URLSearchParams(window.location.search);
    const shouldCreate = Boolean(+url.get("create"));
    if (username.length) {
      if (shouldCreate) {
        fetch(apiUrl + `/prejoin`, {
          headers: { "Content-Type": "application/json" },
          method: "POST", body: JSON.stringify({
            username, role
          })
        }).then(r => r.text()).then(roomId => {
          window.location.href = `${window.origin}/room/${roomId}?username=${username}&role=${role}`;
        });
      } else {
        const roomId = url.get("roomId");
        console.log(roomId, role, username);
        window.location.href = `${window.origin}/room/${roomId}?username=${username}&role=${role}`;
      }
    }
  });
}