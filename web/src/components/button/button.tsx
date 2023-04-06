import styles from "./button.module.css";

interface ButtonProps {
  color?: string;
  text?: string;
  testId?: string;
  action?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}
export const Button = (props: ButtonProps) => {
  const color = props.color || "primary";
  const disabled = props.disabled || false;
  const testId = props.testId || "";
  let classes = styles.btn;
  if (color === "primary") classes += ` ${styles.primary}`;
  if (color === "default") classes += ` ${styles.default}`;
  if (disabled) classes += ` ${styles.disabled}`;
  return (
    <button
      type="button"
      data-testid={testId}
      disabled={disabled}
      className={classes}
      onClick={props.action}
    >
      {props.children}
    </button>
  );
};
