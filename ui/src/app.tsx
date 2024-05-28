import { Route, Routes, useNavigate } from "@solidjs/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { Component, lazy } from "solid-js";
import { Toaster } from "solid-toast";
import { Header } from "./components/header/header";
import { RoomProvider } from "./pages/room/roomState";

const queryClient = new QueryClient();

const Home = lazy(() => import("./pages/home/home"));
const PrejoinForm = lazy(() => import("./pages/prejoin/prejoinForm"));
const Room = lazy(() => import("./pages/room/room"));
export const App = () => {
  return (
    <QueryClientProvider client={queryClient} >
      <RoomProvider >
        <Header />
        <Routes>
          <Route path="/" component={Home} />
          <Route path="/prejoin" component={PrejoinForm} />
          <Route path="/room/:roomId" component={Room} />
          <Route path="*" component={NoComponent}></Route>
        </Routes>
        <Toaster position="top-right" gutter={8} />
      </RoomProvider>
    </QueryClientProvider>
  );
};
const NoComponent: Component = () => {
  const navigate = useNavigate();
  navigate("/");
  return <></>;
};
