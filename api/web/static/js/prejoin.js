const usernameInput = document.querySelector('input[name="username"]');
const isSpectatorInput = document.querySelector('input[name="isSpectator"]');
const localStorageKeys = {
  username: 'username',
  isSpectator: 'isSpectator',
}
// validate user input changes and save to local storage
if (usernameInput) {
  usernameInput.addEventListener('input', (e) => {
    const submit = document.querySelector('button[type="submit"]');
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
  isSpectatorInput.addEventListener('change', (e) => {
    const isSpectator = e.target.checked;
    localStorage.setItem(localStorageKeys.isSpectator, isSpectator);
  });
}