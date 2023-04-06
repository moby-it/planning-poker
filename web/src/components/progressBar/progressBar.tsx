import { useEffect, useState } from "react";
import styles from "./progressBar.module.css";
let init = false;
interface ProgressBarProps {
  duration: number;
}
export const ProgressBar = (props: ProgressBarProps) => {
  const [width, setWidth] = useState(1);
  const intervalTime = 10;
  let i = 1;
  useEffect(() => {
    if (!init) {
      const interval = setInterval(() => {
        if (width >= 100) {
          clearInterval(interval);
          return;
        }
        setWidth(((i * intervalTime) / props.duration) * 100);
        i++;
      }, intervalTime);
    }

  }, []);

  return (
    <div className={styles.progressBar} >
      <div className={styles.bar} style={{ width: width + "%" }}></div>
    </div>
  );
};
