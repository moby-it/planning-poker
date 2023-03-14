import { children, Component, JSXElement, mergeProps } from "solid-js";
import "./button.css";
export const Button: Component<{
  color?: string;
  text?: string;
  action?: () => void;
  disabled?: boolean;
  children?: JSXElement;
}> = (_props) => {
  const props = mergeProps({ color: "primary", disabled: false }, _props);
  const c = children(() => props.children);
  return (
    <button
      type="button"
      disabled={props.disabled}
      classList={{
        btn: true,
        primary: props.color === "primary",
        disabled: props.disabled,
      }}
      onClick={props.action}
    >
      {c()}
    </button>
  );
};
