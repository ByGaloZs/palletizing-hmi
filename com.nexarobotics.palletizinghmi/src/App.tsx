/*
    BSD 3-Clause License    
    Copyright (c) 2023, Doosan Robotics Inc.
*/

import React from "react";
import { useTranslation } from "react-i18next";

// API DART v4
import {
  ModuleContext,
  Context,
  IProgramManager,
  ProgramStopType,
} from "dart-api";

// Estilos
import styles from "./assets/styles/styles.module.scss";

// Componentes propios
import ControlButtons from "./components/ControlButtons";
import PalletStatePanel from "./components/PalletStatePanel";

// Utilidad DRL
import DrlUtils from "./DrlUtils";
import testDrl from "./doosan_scripts/test.drl";

interface IAppProps {
  moduleContext: ModuleContext;
}

function App(props: IAppProps) {
  const { moduleContext } = props;
  const { t } = useTranslation(moduleContext.packageName);

  const drlUtils = React.useMemo(() => DrlUtils.getInstance(), []);
  const programManager = React.useMemo(
    () =>
      moduleContext.getSystemManager(Context.PROGRAM_MANAGER) as IProgramManager,
    [moduleContext]
  );

  // Máximos de pallet
  const MAX_LAYERS = 9;
  const MAX_SLOTS = 9;

  // Estados
  const [isPaused, setIsPaused] = React.useState(false);
  const [isStarted, setIsStarted] = React.useState(false);

  const [leftEnabled, setLeftEnabled] = React.useState(true);
  const [rightEnabled, setRightEnabled] = React.useState(false);

  const [leftLayer, setLeftLayer] = React.useState<number>(1);
  const [leftSlot, setLeftSlot] = React.useState<number>(1);
  const [rightLayer, setRightLayer] = React.useState<number>(1);
  const [rightSlot, setRightSlot] = React.useState<number>(1);

  const [leftPalletDetected, setLeftPalletDetected] =
    React.useState<boolean>(false);
  const [rightPalletDetected, setRightPalletDetected] =
    React.useState<boolean>(false);

  // ---------------------------
  // CÁLCULO DE CONFIGURACIÓN
  // ---------------------------

  let selectedSide: "none" | "left" | "right" | "both" = "none";
  let selectedLayer = 0;
  let selectedSlot = 0;

  if (leftEnabled && rightEnabled) {
    selectedSide = "both";
    selectedLayer = leftLayer;
    selectedSlot = leftSlot;
  } else if (leftEnabled) {
    selectedSide = "left";
    selectedLayer = leftLayer;
    selectedSlot = leftSlot;
  } else if (rightEnabled) {
    selectedSide = "right";
    selectedLayer = rightLayer;
    selectedSlot = rightSlot;
  }

  const configIsValid =
    selectedSide !== "none" && selectedLayer >= 1 && selectedSlot >= 1;

  // ---------------------------
  // HABILITACIÓN DE BOTONES
  // ---------------------------

  const isStartDisabled = !configIsValid || isStarted;
  const isPauseDisabled = !isStarted || !configIsValid;
  const isStopDisabled = !isStarted || !configIsValid;
  const isGoHomeDisabled = isStarted; // ⬅ NUEVO

  // ============================
  // HANDLERS
  // ============================

  const handleStart = () => {
    if (isStartDisabled) return;

    try {
      console.log("Iniciar palletizing:", selectedSide);
      drlUtils.runProgram(moduleContext, testDrl, [], null, false);

      setIsPaused(false);
      setIsStarted(true); // Bloquea todo
    } catch (e) {
      console.error("Error al iniciar:", e);
    }
  };

  const handlePause = async () => {
    if (isPauseDisabled) return;

    try {
      await programManager.pauseProgram();
      setIsPaused(true);
    } catch (e) {
      console.error("Error al pausar:", e);
    }
  };

  const handleContinue = async () => {
    if (isPauseDisabled) return;

    try {
      await programManager.resumeProgram();
      setIsPaused(false);
    } catch (e) {
      console.error("Error al continuar:", e);
    }
  };

  const handleStop = async () => {
    if (isStopDisabled) return;

    try {
      await programManager.stopProgram(ProgramStopType.QUICK);
      setIsPaused(false);
      setIsStarted(false); // Desbloquea configuración
    } catch (e) {
      console.error("Error al detener:", e);
    }
  };

  const handleGoHome = () => {
    if (isGoHomeDisabled) return;
    console.log("GO HOME ejecutado");
  };

  const handleResetLeft = () => {
    if (isStarted) return;
    setLeftLayer(1);
    setLeftSlot(1);
  };

  const handleResetRight = () => {
    if (isStarted) return;
    setRightLayer(1);
    setRightSlot(1);
  };

  // ============================
  // RENDER
  // ============================

  return (
    <div className={styles.mainContainer}>
      <PalletStatePanel
        leftEnabled={leftEnabled}
        rightEnabled={rightEnabled}
        onChangeLeftEnabled={setLeftEnabled}
        onChangeRightEnabled={setRightEnabled}
        leftLayer={leftLayer}
        leftSlot={leftSlot}
        rightLayer={rightLayer}
        rightSlot={rightSlot}
        onChangeLeftLayer={setLeftLayer}
        onChangeLeftSlot={setLeftSlot}
        onChangeRightLayer={setRightLayer}
        onChangeRightSlot={setRightSlot}
        onResetLeft={handleResetLeft}
        onResetRight={handleResetRight}
        leftPalletDetected={leftPalletDetected}
        rightPalletDetected={rightPalletDetected}
        configDisabled={isStarted} 
        leftMaxLayers={MAX_LAYERS}
        leftMaxSlots={MAX_SLOTS}
        rightMaxLayers={MAX_LAYERS}
        rightMaxSlots={MAX_SLOTS}
      />

      <div className={styles.controlCard}>
        <div className={styles.controlCardHeader}>Palletizing control</div>
        <div className={styles.controlCardBody}>
          <ControlButtons
            onStart={handleStart}
            onPause={handlePause}
            onContinue={handleContinue}
            onStop={handleStop}
            onGoHome={handleGoHome}
            isPaused={isPaused}
            isStartDisabled={isStartDisabled}
            isPauseDisabled={isPauseDisabled}
            isStopDisabled={isStopDisabled}
            isGoHomeDisabled={isGoHomeDisabled} // ⬅ NUEVO
          />
        </div>
      </div>
    </div>
  );
}

export default App;
