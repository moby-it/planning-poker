import { Component, mergeProps } from "solid-js";
import "./toggle.css";
export const Toggle: Component<{
  action: () => void;
  checked?: boolean;
  name: string;
}> = (_props) => {
  const props = mergeProps({ checked: false }, _props);
  return (
    <>
      <label class="switch">
        <input
          name={props.name}
          type="checkbox"
          checked={props.checked}
          onChange={props.action}
        />
        <span class="slider round"></span>
      </label>
    </>
  );
};
