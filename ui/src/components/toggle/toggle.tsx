import { Component, mergeProps } from "solid-js";
import "./toggle.css";
export const Toggle: Component<{
  action: () => void;
  checked?: boolean;
  label?: string;
  name: string;
}> = (_props) => {
  const props = mergeProps({ checked: false }, _props);
  return (
    <div class="toggle-container">
      <label for={props.name}>{props.label}</label>
      <label class="switch">
        <input
          name={props.name}
          type="checkbox"
          checked={props.checked}
          onChange={props.action}
        />
        <span class="slider round"></span>
      </label>
    </div>
  );
};
