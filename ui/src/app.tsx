import { Route, Routes } from "@solidjs/router";
import { lazy } from "solid-js";
import { Header } from "./components/header/header";

const Home = lazy(() => import("./pages/home/home"));
const PrejoinForm = lazy(() => import("./pages/prejoin/prejoinForm"));
const Room = lazy(() => import("./pages/room/room"));
export const App = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" component={Home} />
        <Route path="/prejoin" component={PrejoinForm} />
        <Route path="/room/:roomId" component={Room} />
      </Routes>
    </>
  );
};
