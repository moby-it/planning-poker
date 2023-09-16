export const isSpectatorInput = document.querySelector('input[name="isSpectator"]');

export function registerSpectatorInputEventListener() {
  // save spectator input changes to local storage
  if (isSpectatorInput) {
    const isSpectator = parseInt(localStorage.getItem('isSpectator'));
    if (typeof isSpectator === 'number' && !isNaN(isSpectator)) {
      isSpectatorInput.checked = !!isSpectator;
    } else {
      localStorage.setItem('isSpectator', 0);
      isSpectatorInput.checked = false;
    }
    isSpectatorInput.addEventListener('change', (e) => {
      const isSpectator = e.target.checked;
      localStorage.setItem('isSpectator', isSpectator ? 1 : 0);
    });
  }
}