import { Component, createSignal } from "solid-js";
import "./progressBar.css";
export const ProgressBar: Component<{ duration: number }> = (props) => {
  const [width, setWidth] = createSignal(1);
  const intervalTime = 10;
  let i = 1;
  const interval = setInterval(() => {
    if (width() >= 100) {
      clearInterval(interval);
      return;
    }
    setWidth(((i * intervalTime) / props.duration) * 100);
    i++;
  }, intervalTime);
  return (
    <div id="progress-bar">
      <div id="bar" style={{ width: width() + "%" }}></div>
    </div>
  );
};
