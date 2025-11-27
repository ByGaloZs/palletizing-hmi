/*
    BSD 3-Clause License    
    Copyright (c) 2023, Doosan Robotics Inc.
*/

import React from "react";
import { useTranslation } from "react-i18next";

// Importes del API oficial de DART v4
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
import SideSwitches from "./components/SideSwitches";

// Utilidad para correr DRL
import DrlUtils from "./DrlUtils";

// Importa tu script DRL
import testDrl from "./doosan_scripts/test.drl";

interface IAppProps {
  moduleContext: ModuleContext;
}

function App(props: IAppProps) {
  const { moduleContext } = props;

  // Traducción (por si luego agregas textos)
  const { t } = useTranslation(moduleContext.packageName);

  const drlUtils = React.useMemo(() => DrlUtils.getInstance(), []);

  const programManager = React.useMemo(
    () =>
      moduleContext.getSystemManager(Context.PROGRAM_MANAGER) as IProgramManager,
    [moduleContext]
  );

  // Estado para el botón Pause/Continue
  const [isPaused, setIsPaused] = React.useState(false);

  // Estado para bloquear el botón Start
  const [isStartDisabled, setIsStartDisabled] = React.useState(false);

  // Estado de selectores de lado
  const [leftEnabled, setLeftEnabled] = React.useState(true);
  const [rightEnabled, setRightEnabled] = React.useState(false);

  // ============================
  // HANDLERS
  // ============================

  // START
  const handleStart = () => {
    try {
      // Determinar lado lógico según switches
      let side: string;

      if (leftEnabled && rightEnabled) {
        side = "both";
      } else if (leftEnabled && !rightEnabled) {
        side = "left";
      } else if (!leftEnabled && rightEnabled) {
        side = "right";
      } else {
        // Ninguno seleccionado: podrías bloquear el start o usar un valor por defecto
        side = "none";
      }

      console.log("Lado seleccionado:", side);

      // Aquí, en el futuro, puedes mandar 'side' como parámetro al DRL
      // ej: drlUtils.runProgram(moduleContext, testDrl, [{ name: "side", value: side }], null, false);

      drlUtils.runProgram(moduleContext, testDrl, [], null, false);

      setIsPaused(false);
      setIsStartDisabled(true);
    } catch (e) {
      console.error("Error al iniciar DRL:", e);
    }
  };

  // PAUSE
  const handlePause = async () => {
    try {
      await programManager.pauseProgram();
      setIsPaused(true);
    } catch (e) {
      console.error("Error al pausar:", e);
    }
  };

  // CONTINUE
  const handleContinue = async () => {
    try {
      await programManager.resumeProgram();
      setIsPaused(false);
    } catch (e) {
      console.error("Error al continuar:", e);
    }
  };

  // STOP
  const handleStop = async () => {
    try {
      await programManager.stopProgram(ProgramStopType.QUICK);
      setIsPaused(false);
      setIsStartDisabled(false);
    } catch (e) {
      console.error("Error al detener:", e);
    }
  };

  // ============================
  // RENDER
  // ============================

  return (
    <div className={styles.mainContainer}>
      <ControlButtons
        onStart={handleStart}
        onPause={handlePause}
        onContinue={handleContinue}
        onStop={handleStop}
        isPaused={isPaused}
        isStartDisabled={isStartDisabled}
      />

      <SideSwitches
        leftEnabled={leftEnabled}
        rightEnabled={rightEnabled}
        onChangeLeft={setLeftEnabled}
        onChangeRight={setRightEnabled}
      />
    </div>
  );
}

export default App;
