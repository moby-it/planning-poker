import { useLocation, useNavigate } from "@solidjs/router";
import { Component, Show, createEffect, createSignal } from "solid-js";
import { Logo } from "../logo/Logo";
import "./header.css";
export const Header: Component = () => {
  const location = useLocation();
  const [showLogo, setShowLogo] = createSignal(location.pathname !== "/");
  createEffect(() => {
    setShowLogo(location.pathname !== "/");
  });
  return (
    <div
      class="header row align-center"
      classList={{ "justify-between": showLogo(), "justify-end": !showLogo() }}
    >
      <Show when={showLogo()}>
        <Logo />
      </Show>
      <span>
        Made By{" "}
        <a class="moby-link" href="https://moby-it.com" target="_black">
          Moby IT
        </a>
      </span>
    </div>
  );
};
