const username = localStorage.getItem("username") || "";
const role = localStorage.getItem("role") || "";
if (!role || !username ) {
  console.log("should set room id to session storage and navigate to prejoin");
} else {
  console.log("should connect to room");
}