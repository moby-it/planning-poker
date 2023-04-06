import styles from "./toggle.module.css";

interface ToggleProps {
  action: () => void;
  checked?: boolean;
  disabled?: boolean;
  testId?: string;
  label?: string;
  name: string;
}

export const Toggle = (props: ToggleProps) => {
  const checked = Boolean(props.checked);
  const disabled = Boolean(props.disabled);

  return (
    <div className={styles.toggleContainer}>
      <label htmlFor={props.name}>{props.label}</label>
      <label className={styles.switch}>
        <input
          disabled={disabled}
          name={props.name}
          type="checkbox"
          data-testid={props.testId}
          checked={checked}
          onChange={props.action}
        />
        <span className={`${styles.slider} ${styles.round}`}></span>
      </label>
    </div>
  );
};
