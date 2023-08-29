console.log("room js");
const username = localStorage.getItem("username") || "";
const isSpectator = localStorage.getItem("isSpectator") || false;
if (!username) {
  const splitUrl = document.location.pathname.split("/");
  const roomId = splitUrl[splitUrl.length - 1];
  sessionStorage.setItem('roomId', roomId);
  window.location.href = `${window.origin}/prejoin`;
} else {
  console.log("should connect to room");
}