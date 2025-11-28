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

  // NUEVO: botón SET general (opción A)
  onSetConfig: () => void;
  isSetDisabled: boolean;
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
  onSetConfig,
  isSetDisabled,
}) => {
  // Helper clamp
  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

  // ---- Estados locales para inputs (texto) ----
  const [leftLayerInput, setLeftLayerInput] = React.useState(
    leftLayer.toString()
  );
  const [leftSlotInput, setLeftSlotInput] = React.useState(
    leftSlot.toString()
  );
  const [rightLayerInput, setRightLayerInput] = React.useState(
    rightLayer.toString()
  );
  const [rightSlotInput, setRightSlotInput] = React.useState(
    rightSlot.toString()
  );

  // Sincronizar si el padre cambia los valores (reset, carga, etc.)
  React.useEffect(() => {
    setLeftLayerInput(leftLayer.toString());
  }, [leftLayer]);

  React.useEffect(() => {
    setLeftSlotInput(leftSlot.toString());
  }, [leftSlot]);

  React.useEffect(() => {
    setRightLayerInput(rightLayer.toString());
  }, [rightLayer]);

  React.useEffect(() => {
    setRightSlotInput(rightSlot.toString());
  }, [rightSlot]);

  // ---- HANDLERS LEFT ----

  const handleLeftLayerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLeftLayerInput(e.target.value); // sin validar aún
  };

  const handleLeftLayerBlur = () => {
    const val = parseInt(leftLayerInput, 10);

    if (Number.isNaN(val)) {
      const fallback = 1;
      onChangeLeftLayer(fallback);
      setLeftLayerInput(fallback.toString());
      return;
    }

    const cleaned = clamp(val, 1, leftMaxLayers);
    onChangeLeftLayer(cleaned);
    setLeftLayerInput(cleaned.toString());
  };

  const handleLeftSlotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLeftSlotInput(e.target.value);
  };

  const handleLeftSlotBlur = () => {
    const val = parseInt(leftSlotInput, 10);

    if (Number.isNaN(val)) {
      const fallback = 1;
      onChangeLeftSlot(fallback);
      setLeftSlotInput(fallback.toString());
      return;
    }

    const cleaned = clamp(val, 1, leftMaxSlots);
    onChangeLeftSlot(cleaned);
    setLeftSlotInput(cleaned.toString());
  };

  // ---- HANDLERS RIGHT ----

  const handleRightLayerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRightLayerInput(e.target.value);
  };

  const handleRightLayerBlur = () => {
    const val = parseInt(rightLayerInput, 10);

    if (Number.isNaN(val)) {
      const fallback = 1;
      onChangeRightLayer(fallback);
      setRightLayerInput(fallback.toString());
      return;
    }

    const cleaned = clamp(val, 1, rightMaxLayers);
    onChangeRightLayer(cleaned);
    setRightLayerInput(cleaned.toString());
  };

  const handleRightSlotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRightSlotInput(e.target.value);
  };

  const handleRightSlotBlur = () => {
    const val = parseInt(rightSlotInput, 10);

    if (Number.isNaN(val)) {
      const fallback = 1;
      onChangeRightSlot(fallback);
      setRightSlotInput(fallback.toString());
      return;
    }

    const cleaned = clamp(val, 1, rightMaxSlots);
    onChangeRightSlot(cleaned);
    setRightSlotInput(cleaned.toString());
  };

  // ---- Toggles ----

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
              value={leftLayerInput}
              onChange={handleLeftLayerChange}
              onBlur={handleLeftLayerBlur}
              disabled={!leftEnabled || configDisabled}
              min={1}
              max={leftMaxLayers}
            />
            <span className={styles.palletFieldMax}>/ {leftMaxLayers}</span>
          </div>

          {/* Slot */}
          <div className={styles.palletFieldRow}>
            <span className={styles.palletFieldLabel}>Slot</span>
            <input
              type="number"
              className={styles.palletNumberInput}
              value={leftSlotInput}
              onChange={handleLeftSlotChange}
              onBlur={handleLeftSlotBlur}
              disabled={!leftEnabled || configDisabled}
              min={1}
              max={leftMaxSlots}
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
              rightPalletDetected
                ? styles.palletStateOn
                : styles.palletStateOff
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
              value={rightLayerInput}
              onChange={handleRightLayerChange}
              onBlur={handleRightLayerBlur}
              disabled={!rightEnabled || configDisabled}
              min={1}
              max={rightMaxLayers}
            />
            <span className={styles.palletFieldMax}>/ {rightMaxLayers}</span>
          </div>

          {/* Slot */}
          <div className={styles.palletFieldRow}>
            <span className={styles.palletFieldLabel}>Slot</span>
            <input
              type="number"
              className={styles.palletNumberInput}
              value={rightSlotInput}
              onChange={handleRightSlotChange}
              onBlur={handleRightSlotBlur}
              disabled={!rightEnabled || configDisabled}
              min={1}
              max={rightMaxSlots}
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

      {/* Footer con botón SET (opción A) */}
      <div className={styles.palletCardFooter}>
        <button 
          className={styles.palletSetBtn}
          onClick={onSetConfig}
          disabled={isSetDisabled}>
          Set config to PLC
        </button>
      </div>
    </div>
  );
};

export default PalletStatePanel;
