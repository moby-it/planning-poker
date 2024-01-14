import anime from 'animejs/lib/anime.es.js';
import { createEffect, createSignal } from "solid-js";

export function transformH1() {
  const title: any = document.querySelector('h1');
  title.innerHTML = title.textContent.replace(/\S/g,
    `<span class='letter' style='top:-100; position:relative; display: inline-block'>$&</span>`);
}
export function hide(...selectors: string[]) {
  selectors.forEach(s => document.querySelectorAll(s).forEach(v => (v as any).style.opacity = 0));
}
export function fade(selector: string, duration = 1000) {
  return {
    targets: selector,
    opacity: [0, 1],
    easing: 'easeInOutQuad',
    duration
  };
};
function staggerEnterFromRight(selector: string, duration = 1000) {
  anime({
    targets: selector,
    opacity: [0, 1],
    translateX: [200, 0],
    easing: 'easeInOutElastic(1,1.5)',
    delay: anime.stagger(500),
    duration
  });
}
function animateWord(selector: string) {
  const textNodes = document.querySelectorAll(selector);
  anime({
    targets: textNodes,
    translateY: [-100, 0],
    opacity: [0, 1],
    easing: 'easeInOutQuad',
    delay: anime.stagger(100),
    duration: 300
  });
}
function fromTop(selector: string) {
  anime({
    targets: selector,
    opacity: 1,
    translateY: [-100, 0],
    duration: 1000
  });
}
export function registerAnimations() {
  const [timer, setTimer] = createSignal(0);
  const showHeader = () => timer() > 1;
  const showTags = () => timer() > 5;
  const showBy = () => timer() > 6;
  const interval = setInterval(() => {
    setTimer(v => v += 1);
    if (timer() > 10)
      clearInterval(interval);
  }, 400);

  // header
  createEffect((prev) => {
    if (showHeader() && !prev) {
      animateWord('.letter');
      fromTop('.home > div > img');
    }
    return showHeader();
  });
  // tags
  createEffect((prev) => {
    if (showTags() && !prev) {
      anime(fade('#start-here'));
      anime(fade('.subtitle > *'));
    }
    return showTags();
  });
  // show 'made by moby' on top right
  createEffect((prev) => {
    if (showBy() && !prev) {
      anime(fade('.header span'));
    }
    return showBy();
  });
}