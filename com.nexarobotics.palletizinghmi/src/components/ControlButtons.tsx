import React from "react";
import styles from "../assets/styles/styles.module.scss";

interface Props {
  onStart: () => void;
  onPause: () => void;
  onContinue: () => void;
  onStop: () => void;
  onGoHome: () => void;

  isPaused: boolean;
  isStartDisabled: boolean;
  isPauseDisabled: boolean;
  isStopDisabled: boolean;
  isGoHomeDisabled: boolean; // ⬅ NUEVO
}

const ControlButtons: React.FC<Props> = ({
  onStart,
  onPause,
  onContinue,
  onStop,
  onGoHome,
  isPaused,
  isStartDisabled,
  isPauseDisabled,
  isStopDisabled,
  isGoHomeDisabled,
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

      {/* PAUSE / CONTINUE */}
      {isPaused ? (
        <button
          className={`${styles.btn} ${styles.btnPause} ${
            isPauseDisabled ? styles.btnDisabled : ""
          }`}
          onClick={onContinue}
          disabled={isPauseDisabled}
        >
          Continue
        </button>
      ) : (
        <button
          className={`${styles.btn} ${styles.btnPause} ${
            isPauseDisabled ? styles.btnDisabled : ""
          }`}
          onClick={onPause}
          disabled={isPauseDisabled}
        >
          Pause
        </button>
      )}

      {/* STOP */}
      <button
        className={`${styles.btn} ${styles.btnStop} ${
          isStopDisabled ? styles.btnDisabled : ""
        }`}
        onClick={onStop}
        disabled={isStopDisabled}
      >
        Stop
      </button>

      {/* GO HOME */}
      <button
        className={`${styles.btn} ${styles.btnGoHome} ${
          isGoHomeDisabled ? styles.btnDisabled : ""
        }`}
        onClick={onGoHome}
        disabled={isGoHomeDisabled}
      >
        Go Home!
      </button>
    </div>
  );
};

export default ControlButtons;
