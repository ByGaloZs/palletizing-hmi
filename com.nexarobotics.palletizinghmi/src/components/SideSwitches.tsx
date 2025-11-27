import React from "react";
import styles from "../assets/styles/styles.module.scss";
import ToggleSwitch from "./ToggleSwitch";

interface Props {
  leftEnabled: boolean;
  rightEnabled: boolean;
  onChangeLeft: (value: boolean) => void;
  onChangeRight: (value: boolean) => void;
}

const SideSwitches: React.FC<Props> = ({
  leftEnabled,
  rightEnabled,
  onChangeLeft,
  onChangeRight,
}) => {
  return (
    <div className={styles.sidePanel}>
      <div className={styles.sidePanelTitle}>Lado de paletizado</div>

      <ToggleSwitch
        label="Izquierda"
        value={leftEnabled}
        onChange={onChangeLeft}
      />

      <ToggleSwitch
        label="Derecha"
        value={rightEnabled}
        onChange={onChangeRight}
      />
    </div>
  );
};

export default SideSwitches;
