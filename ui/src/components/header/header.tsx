import { useLocation, useNavigate } from "@solidjs/router";
import { Component, createEffect, createSignal, Show } from "solid-js";
import "./header.css";
export const Header: Component = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogo, setShowLogo] = createSignal(location.pathname !== "/");
  createEffect(() => {
    setShowLogo(location.pathname !== "/");
  });
  return (
    <div
      class="header row align-center"
      style={{ cursor: "pointer" }}
      onClick={() => navigate("/")}
      classList={{ "justify-between": showLogo(), "justify-end": !showLogo() }}
    >
      <Show when={showLogo()}>
        <img src="/logo.png" width="198" height="42" />
      </Show>
      <span>Made By Moby IT</span>
    </div>
  );
};
