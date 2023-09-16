// Function to create a toaster
function createToaster(type, text) {
  const toaster = document.createElement('div');
  toaster.className = `toaster ${type}`;
  toaster.innerText = text;
  
  const container = document.getElementById('toaster-container');
  container.appendChild(toaster);

  // Show toaster
  setTimeout(() => {
    toaster.style.opacity = "1";
  }, 10);

  // Remove toaster
  setTimeout(() => {
    toaster.style.opacity = "0";
    setTimeout(() => {
      container.removeChild(toaster);
    }, 500);
  }, 3000);
}

// Attach to window object
window.showSuccess = function(text) { createToaster('success', text); }
window.showError = function(text) { createToaster('error', text); }
window.showWarn = function(text) { createToaster('warn', text); }
