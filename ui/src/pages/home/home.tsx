import { useNavigate } from "@solidjs/router";
import { Component, Show, createSignal } from "solid-js";
import { Button } from "../../components/button/button";
import "./home.css";
import { Transition } from "solid-transition-group";
import anime from 'animejs/lib/anime.es.js';
const Home: Component = () => {
  const navigate = useNavigate();
  const [timer, setTimer] = createSignal(0);
  const interval = setInterval(() => {
    setTimer(v => v += 1);
    if (timer() > 5)
      clearInterval(interval);
  }, 300);
  const showHeader = () => timer() > 1;
  const showTags = () => timer() > 2;
  const showDesc = () => timer() > 3;
  const showRest = () => timer() > 4;
  function fade(el: Element) {
    anime({
      targets: el,
      opacity: [0, 1],
      easing: 'easeInOutQuad',
      duration: 1000
    });
  }
  function enter(el: Element, done: () => void) {
    anime({
      targets: el,
      opacity: 1,
      translateY: [0, 100],
    });
  }
  return (
    <div class="col home">
      <div class="row align-center title" style="top:-100px; position:relative">
        <Transition onEnter={enter}>
          <Show when={showHeader()}>
            <img src="/icon-lg.svg" width="105" height="98" alt="" srcset="" />
          </Show>
        </Transition>
        <Transition onEnter={enter} >
          <Show when={showHeader()}>
            <h1 data-testid="title">Poker Planning</h1>
          </Show>
        </Transition>
      </div>
      <div class="welcome-box col">
        <Transition onEnter={fade}>
          <Show when={showTags()}>

            <div class="subtitle">
              <img id="testid" src="/check.svg" alt="check" srcset="" />
              user-friendly
              <a href="https://github.com/moby-it/planning-poker" target="_blank">
                <img src="/github.svg" alt="github" srcset="" />
                <u>open-sourced</u>
              </a>
              <span>
                <img
                  src="/check.svg"
                  class="primary"
                  alt="check"
                  srcset=""
                />
                free forever
              </span>
            </div>
          </Show>
        </Transition>
        <Transition onEnter={fade}>
          <Show when={showDesc()}>
            <span>
              We got tired of searching for free solution for doing{" "}
              <strong>
                Scrum Poker Planning
              </strong>
              , so we decided to solve the issue ourselves and open-source it.
            </span>
          </Show>
        </Transition>
        <Transition onEnter={fade}>
          <Show when={showRest()}>
            <div style="align-self:center;" data-testid="start-here">
              <Button action={() => navigate("prejoin?create=true")}>
                <span>Start Here</span>
              </Button>
            </div>
          </Show>
        </Transition>
      </div>
    </div >
  );
};
export default Home;
