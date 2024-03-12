import { Component, JSXElement, mergeProps } from "solid-js";
import "./button.css";

type Options = {
  color: string;
  text: string;
  type: 'submit' | 'button';
};
export const Button: Component<{
  options?: Partial<Options>;
  action?: () => void;
  testId: string;
  disabled?: boolean;
  children?: JSXElement;
}> = (_props) => {
  const props = mergeProps(
    {
      options: {
        color: "primary",
        testId: "",
        type: 'button' as const
      },
      disabled: false
    },
    _props
  );
  return (
    <button
      type={props.options.type}
      data-testid={props.testId}
      disabled={props.disabled}
      classList={{
        btn: true,
        primary: props.options.color === "primary",
        default: props.options.color === "default",
        disabled: props.disabled,
      }}
      onClick={props.action}
    >
      {props.children}
    </button>
  );
};
