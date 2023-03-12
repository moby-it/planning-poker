import { children, Component, JSXElement, mergeProps } from "solid-js";
import "./button.css";
export const Button: Component<{
  color?: string;
  text?: string;
  action?: () => void;
  children?: JSXElement;
}> = (_props) => {
  const props = mergeProps({ color: "primary" }, _props);
  const c = children(() => props.children);
  return (
    <button
      type="button"
      classList={{ btn: true, primary: props.color === "primary" }}
      onClick={props.action}
    >
      {c()}
    </button>
  );
};
