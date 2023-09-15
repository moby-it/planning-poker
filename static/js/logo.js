
const header = document.querySelector(".header.row");
const pokerPlanningLogo = document.querySelector(".logo");
if (document.location.pathname === '/') {
  pokerPlanningLogo.remove();
  const header = document.querySelector(".header.row");
  header.classList.remove('justify-between');
  header.classList.add("justify-end");
} else {
  pokerPlanningLogo.addEventListener('click', () => {
    window.location.href = "/";
  });
}