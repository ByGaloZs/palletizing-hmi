import React from "react";
import styles from "../assets/styles/styles.module.scss";

interface Props {
  label?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

const ToggleSwitch: React.FC<Props> = ({ label, value, onChange }) => {
  return (
    <div className={styles.toggleContainer}>
      {label && <span className={styles.toggleLabel}>{label}</span>}

      <div
        className={`${styles.toggleSwitch} ${value ? styles.on : styles.off}`}
        onClick={() => onChange(!value)}
      >
        <div className={styles.toggleCircle}></div>
      </div>
    </div>
  );
};

export default ToggleSwitch;
