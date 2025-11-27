import React from "react";
import styles from "../assets/styles/styles.module.scss";

interface Props {
  label?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<Props> = ({ label, value, onChange, disabled }) => {
  return (
    <div
      className={`${styles.toggleContainer} ${
        disabled ? styles.toggleContainerDisabled : ""
      }`}
    >
      {label && <span className={styles.toggleLabel}>{label}</span>}

      <div
        className={`${styles.toggleSwitch} ${
          value ? styles.on : styles.off
        } ${disabled ? styles.toggleSwitchDisabled : ""}`}
        onClick={() => {
          if (!disabled) onChange(!value);
        }}
      >
        <div className={styles.toggleCircle}></div>
      </div>
    </div>
  );
};

export default ToggleSwitch;
