const usernameInput = document.querySelector('input[name="username"]');
const isSpectatorInput = document.querySelector('input[name="isSpectator"]');
const submit = document.querySelector('#submit');
const apiUrl = window.location.origin + "/api/v1";
const localStorageKeys = {
  username: 'username',
  isSpectator: 'isSpectator',
};
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
// save spectator input changes to local storage
if (isSpectatorInput) {
  const isSpectator = parseInt(localStorage.getItem(localStorageKeys.isSpectator));
  if (typeof isSpectator === 'number' && !isNaN(isSpectator)) {
    isSpectatorInput.checked = !!isSpectator;
  } else {
    localStorage.setItem(localStorageKeys.isSpectator, 0);
    isSpectator.checked = false;
  }
  isSpectatorInput.addEventListener('change', (e) => {
    const isSpectator = e.target.checked;
    localStorage.setItem(localStorageKeys.isSpectator, isSpectator ? 1 : 0);
  });
}
// register submit handler
if (submit) {
  submit.addEventListener('click', () => {
    const username = usernameInput.value;
    const url = new URLSearchParams(window.location.search);
    const shouldCreate = Boolean(+url.get("create"));
    if (username.length) {
      if (shouldCreate) {
        fetch(apiUrl + "/createRoom", { method: "POST" }).then(r => r.text()).then(roomId => {
          window.location.href = `${window.origin}/room/${roomId}`;
        });
      } else {
        const roomId = sessionStorage.getItem('roomId');
        window.location.href = `${window.origin}/room/${roomId}`;
      }
    }
  });
}