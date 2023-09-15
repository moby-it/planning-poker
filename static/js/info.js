const infoEl = document.querySelector('.info');
let hoverEl;
let lastHoveredEl;
document.addEventListener('mouseover', (e) => {
  lastHoveredEl = e.target;
});
function removePopupTimeout() {
  setTimeout(() => {
    if (lastHoveredEl.classList.contains('info') ||
      lastHoveredEl.classList.contains('warn-popup') ||
      lastHoveredEl.classList.contains('moby-link')) {
      removePopupTimeout();
      return;
    }
    if (hoverEl) {
      hoverEl.remove();
      hoverEl = null;
    }
  }, 1000);
}
infoEl.addEventListener('mouseenter', () => {
  if (!hoverEl) {
    const logo = document.querySelector('.logo');
    hoverEl = createHoverTextEl();
    logo.appendChild(hoverEl);
  }
});
infoEl.addEventListener('mouseleave', () => {
  removePopupTimeout();
});

function createHoverTextEl() {
  const hoverText = document.createElement('span');
  hoverText.innerHTML = `We are testing a new version of the app. Should you find any bugs, please submit 
  an issue at <a class="moby-link" href="https://github.com/moby-it/planning-poker">our github project</a> 
  or email us directly at <a class="moby-link" target="_blank" href="mailto:contact@moby-it.com">contact@moby-it.com</a>
  <br />
  In case you have too many issues you can still use the old version at 
  <a class="moby-link" href="https://v1.poker-planning.net/v1">https://v1.poker-planning.net/v1</a>
  `
    ;
  hoverText.classList.add('warn-popup');
  return hoverText;
}