import React from "react";
import styles from "../assets/styles/styles.module.scss";

interface PalletStatePanelProps {
  // Habilitado por lado
  leftEnabled: boolean;
  rightEnabled: boolean;
  onChangeLeftEnabled: (v: boolean) => void;
  onChangeRightEnabled: (v: boolean) => void;

  // Layer / Slot
  leftLayer: number;
  leftSlot: number;
  rightLayer: number;
  rightSlot: number;

  onChangeLeftLayer: (v: number) => void;
  onChangeLeftSlot: (v: number) => void;
  onChangeRightLayer: (v: number) => void;
  onChangeRightSlot: (v: number) => void;

  // Reset botones
  onResetLeft: () => void;
  onResetRight: () => void;

  // Estado de detección de pallet (en el futuro vendrá del PLC)
  leftPalletDetected: boolean;
  rightPalletDetected: boolean;

  // Cuando el programa está corriendo, se bloquea la configuración
  configDisabled: boolean;

  // Límites por lado
  leftMaxLayers: number;
  leftMaxSlots: number;
  rightMaxLayers: number;
  rightMaxSlots: number;
}

const PalletStatePanel: React.FC<PalletStatePanelProps> = ({
  leftEnabled,
  rightEnabled,
  onChangeLeftEnabled,
  onChangeRightEnabled,
  leftLayer,
  leftSlot,
  rightLayer,
  rightSlot,
  onChangeLeftLayer,
  onChangeLeftSlot,
  onChangeRightLayer,
  onChangeRightSlot,
  onResetLeft,
  onResetRight,
  leftPalletDetected,
  rightPalletDetected,
  configDisabled,
  leftMaxLayers,
  leftMaxSlots,
  rightMaxLayers,
  rightMaxSlots,
}) => {
  // Helpers de clamp para los inputs numéricos
  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

  const handleLeftLayerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value || "0", 10);
    if (Number.isNaN(val)) return;
    onChangeLeftLayer(clamp(val, 1, leftMaxLayers));
  };

  const handleLeftSlotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value || "0", 10);
    if (Number.isNaN(val)) return;
    onChangeLeftSlot(clamp(val, 1, leftMaxSlots));
  };

  const handleRightLayerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value || "0", 10);
    if (Number.isNaN(val)) return;
    onChangeRightLayer(clamp(val, 1, rightMaxLayers));
  };

  const handleRightSlotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value || "0", 10);
    if (Number.isNaN(val)) return;
    onChangeRightSlot(clamp(val, 1, rightMaxSlots));
  };

  const handleToggleLeft = () => {
    if (configDisabled) return;
    onChangeLeftEnabled(!leftEnabled);
  };

  const handleToggleRight = () => {
    if (configDisabled) return;
    onChangeRightEnabled(!rightEnabled);
  };

  return (
    <div className={styles.palletCard}>
      <div className={styles.palletCardHeader}>Pallet state</div>

      <div className={styles.palletCardBody}>
        {/* ---------------- LEFT SIDE ---------------- */}
        <div className={styles.palletSide}>
          <div className={styles.palletSideHeader}>
            <div className={styles.palletSideTitle}>Left pallet</div>

            <div
              className={`${styles.toggleContainer} ${
                configDisabled ? styles.toggleContainerDisabled : ""
              }`}
            >
              <div
                className={`${styles.toggleSwitch} ${
                  leftEnabled ? styles.on : styles.off
                } ${configDisabled ? styles.toggleSwitchDisabled : ""}`}
                onClick={handleToggleLeft}
              >
                <div className={styles.toggleCircle} />
              </div>
            </div>
          </div>

          {/* Pastilla de estado (LED cápsula) */}
          <div
            className={`${styles.palletStatePill} ${
              leftPalletDetected ? styles.palletStateOn : styles.palletStateOff
            }`}
          >
            {leftPalletDetected ? "Pallet detected" : "No pallet detected"}
          </div>

          {/* Layer */}
          <div className={styles.palletFieldRow}>
            <span className={styles.palletFieldLabel}>Layer</span>
            <input
              type="number"
              className={styles.palletNumberInput}
              value={leftLayer}
              min={1}
              max={leftMaxLayers}
              onChange={handleLeftLayerChange}
              disabled={!leftEnabled || configDisabled}
            />
            <span className={styles.palletFieldMax}>/ {leftMaxLayers}</span>
          </div>

          {/* Slot */}
          <div className={styles.palletFieldRow}>
            <span className={styles.palletFieldLabel}>Slot</span>
            <input
              type="number"
              className={styles.palletNumberInput}
              value={leftSlot}
              min={1}
              max={leftMaxSlots}
              onChange={handleLeftSlotChange}
              disabled={!leftEnabled || configDisabled}
            />
            <span className={styles.palletFieldMax}>/ {leftMaxSlots}</span>
          </div>

          <button
            className={styles.palletResetBtn}
            onClick={onResetLeft}
            disabled={!leftEnabled || configDisabled}
          >
            ⟳ Reset
          </button>
        </div>

        {/* Divider vertical */}
        <div className={styles.palletDivider} />

        {/* ---------------- RIGHT SIDE ---------------- */}
        <div className={styles.palletSide}>
          <div className={styles.palletSideHeader}>
            <div className={styles.palletSideTitle}>Right pallet</div>

            <div
              className={`${styles.toggleContainer} ${
                configDisabled ? styles.toggleContainerDisabled : ""
              }`}
            >
              <div
                className={`${styles.toggleSwitch} ${
                  rightEnabled ? styles.on : styles.off
                } ${configDisabled ? styles.toggleSwitchDisabled : ""}`}
                onClick={handleToggleRight}
              >
                <div className={styles.toggleCircle} />
              </div>
            </div>
          </div>

          {/* Pastilla de estado (LED cápsula) */}
          <div
            className={`${styles.palletStatePill} ${
              rightPalletDetected ? styles.palletStateOn : styles.palletStateOff
            }`}
          >
            {rightPalletDetected ? "Pallet detected" : "No pallet detected"}
          </div>

          {/* Layer */}
          <div className={styles.palletFieldRow}>
            <span className={styles.palletFieldLabel}>Layer</span>
            <input
              type="number"
              className={styles.palletNumberInput}
              value={rightLayer}
              min={1}
              max={rightMaxLayers}
              onChange={handleRightLayerChange}
              disabled={!rightEnabled || configDisabled}
            />
            <span className={styles.palletFieldMax}>/ {rightMaxLayers}</span>
          </div>

          {/* Slot */}
          <div className={styles.palletFieldRow}>
            <span className={styles.palletFieldLabel}>Slot</span>
            <input
              type="number"
              className={styles.palletNumberInput}
              value={rightSlot}
              min={1}
              max={rightMaxSlots}
              onChange={handleRightSlotChange}
              disabled={!rightEnabled || configDisabled}
            />
            <span className={styles.palletFieldMax}>/ {rightMaxSlots}</span>
          </div>

          <button
            className={styles.palletResetBtn}
            onClick={onResetRight}
            disabled={!rightEnabled || configDisabled}
          >
            ⟳ Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default PalletStatePanel;
