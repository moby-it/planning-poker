import { initHome } from "./home.js";
import { initPrejoin } from "./prejoin.js";
import { initRoom } from "./room.js";
import { start } from "./router.js";

start([
  { match: (path) => path === "/", init: initHome },
  { match: (path) => path === "/prejoin", init: initPrejoin },
  { match: (path) => path.startsWith("/room/"), init: initRoom },
]);
