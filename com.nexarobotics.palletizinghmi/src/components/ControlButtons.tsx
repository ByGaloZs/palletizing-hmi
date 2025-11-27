import React from "react";
import styles from "../assets/styles/styles.module.scss";

interface Props {
  onStart: () => void;
  onPause: () => void;
  onContinue: () => void;
  onStop: () => void;
  isPaused: boolean;
  isStartDisabled: boolean;   // 👈 nuevo prop
}

const ControlButtons: React.FC<Props> = ({
  onStart,
  onPause,
  onContinue,
  onStop,
  isPaused,
  isStartDisabled,
}) => {
  return (
    <div className={styles.controlsRow}>
      {/* START */}
      <button
        className={`${styles.btn} ${styles.btnStart} ${
          isStartDisabled ? styles.btnDisabled : ""
        }`}
        onClick={onStart}
        disabled={isStartDisabled}
      >
        Start
      </button>

      {/* PAUSE / CONTINUE dinámico */}
      {isPaused ? (
        <button
          className={`${styles.btn} ${styles.btnContinue}`}
          onClick={onContinue}
        >
          Continue
        </button>
      ) : (
        <button
          className={`${styles.btn} ${styles.btnPause}`}
          onClick={onPause}
        >
          Pause
        </button>
      )}

      {/* STOP */}
      <button
        className={`${styles.btn} ${styles.btnStop}`}
        onClick={onStop}
      >
        Stop
      </button>
    </div>
  );
};

export default ControlButtons;
