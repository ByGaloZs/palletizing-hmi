import React from "react";
import { useTranslation } from "react-i18next";

// API DART v4
import {
  ModuleContext,
  Context,
  IProgramManager,
  ProgramStopType,
  ICommunicationManager,
  IIndustrialEthernet,
  IEGprDataType,
} from "dart-api";

// Estilos
import styles from "./assets/styles/styles.module.scss";

// Componentes propios
import ControlButtons from "./components/ControlButtons";
import PalletStatePanel from "./components/PalletStatePanel";

// Utilidad DRL
import DrlUtils from "./DrlUtils";
import testDrl from "./doosan_scripts/test.drl";

// ==== MAPA DE GPR  ====

// ---- BOOL GPR (ENTRADA DESDE PLC → HMI) ----
// Presencia de pallets (bits 8 y 9 del PLC)
const GPR_IN_BOOL_LEFT_PALLET_PRESENT = 8;
const GPR_IN_BOOL_RIGHT_PALLET_PRESENT = 9;

// ---- BOOL GPR (salidas hacia PLC) ----
const GPR_BOOL_LEFT_ENABLED = 0;
const GPR_BOOL_RIGHT_ENABLED = 1;

// ---- INT GPR (salidas hacia PLC) ----
const GPR_INT_SIDE_CODE = 0;
const GPR_INT_LEFT_LAYER = 1;
const GPR_INT_LEFT_SLOT = 2;
const GPR_INT_RIGHT_LAYER = 3;
const GPR_INT_RIGHT_SLOT = 4;

interface IAppProps {
  moduleContext: ModuleContext;
}

function App(props: IAppProps) {
  const { moduleContext } = props;
  const { t } = useTranslation(moduleContext.packageName);

  const drlUtils = React.useMemo(() => DrlUtils.getInstance(), []);

  const programManager = React.useMemo(
    () =>
      moduleContext.getSystemManager(
        Context.PROGRAM_MANAGER
      ) as IProgramManager,
    [moduleContext]
  );

  // ============================
  // COMMUNICATION MANAGER + IE
  // ============================

  const [industrialEthernet, setIndustrialEthernet] =
    React.useState<IIndustrialEthernet | null>(null);

  React.useEffect(() => {
    const comm = moduleContext.getSystemManager(
      Context.COMMUNICATION_MANAGER
    ) as ICommunicationManager | null;

    if (!comm) {
      console.error(
        "[HMI] CommunicationManager no disponible (Context.COMMUNICATION_MANAGER)"
      );
      setIndustrialEthernet(null);
      return;
    }

    if (!comm.industrialEthernet) {
      console.error(
        "[HMI] industrialEthernet no disponible dentro de CommunicationManager"
      );
      setIndustrialEthernet(null);
      return;
    }

    setIndustrialEthernet(comm.industrialEthernet);
  }, [moduleContext]);

  // ============================
  // Lectura periódica PLC → HMI (presencia pallets)
  // ============================

  React.useEffect(() => {
    if (!industrialEthernet) return;

    let cancelled = false;

    const intervalId = setInterval(async () => {
      try {
        // Leer bits de presencia desde el PLC (INPUT, portType = 0)
        const leftData = await industrialEthernet.getInputRegister(
          IEGprDataType.BIT,
          GPR_IN_BOOL_LEFT_PALLET_PRESENT,
          0 // 0: IN
        );

        const rightData = await industrialEthernet.getInputRegister(
          IEGprDataType.BIT,
          GPR_IN_BOOL_RIGHT_PALLET_PRESENT,
          0 // 0: IN
        );

        if (cancelled) return;

        const leftVal = leftData.data;
        const rightVal = rightData.data;

        const leftDetected =
          leftVal === "1" || leftVal === "true" || leftVal === "ON";
        const rightDetected =
          rightVal === "1" || rightVal === "true" || rightVal === "ON";

        setLeftPalletDetected(leftDetected);
        setRightPalletDetected(rightDetected);
      } catch (err) {
        console.error(
          "[HMI] Error leyendo presencia de pallets desde PLC:",
          err
        );
      }
    }, 300); // cada 300 ms aprox.

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [industrialEthernet]);

  // ============================
  // Máximos de pallet
  // ============================

  const MAX_LAYERS = 9;
  const MAX_SLOTS = 9;

  // ============================
  // Estados principales
  // ============================

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

  const [configSentToPLC, setConfigSentToPLC] =
    React.useState(false);

  // ============================
  // Logs HMI
  // ============================

  const [logs, setLogs] = React.useState<string[]>([]);

  const pushLog = React.useCallback((msg: string) => {
    const now = new Date();
    const time = now.toLocaleTimeString();
    const line = `[${time}] ${msg}`;
    setLogs((prev) => [line, ...prev].slice(0, 80));
  }, []);

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

  const leftSideOk = !leftEnabled || leftPalletDetected;
  const rightSideOk = !rightEnabled || rightPalletDetected;

  const configIsValid =
    selectedSide !== "none" &&
    selectedLayer >= 1 &&
    selectedSlot >= 1 &&
    leftSideOk &&
    rightSideOk;

  // ---------------------------
  // HABILITACIÓN DE BOTONES
  // ---------------------------

  const isStartDisabled =
    !configIsValid || !configSentToPLC || isStarted;
  const isPauseDisabled = !isStarted;
  const isStopDisabled = !isStarted;
  const isGoHomeDisabled = isStarted;
  const isSetConfigDisabled =
    !configIsValid || isStarted || configSentToPLC;

  // ============================
  // HANDLERS
  // ============================

  const handleStart = () => {
    if (isStartDisabled) return;

    try {
      pushLog(
        `START → side=${selectedSide}, layer=${selectedLayer}, slot=${selectedSlot}`
      );
      drlUtils.runProgram(moduleContext, testDrl, [], null, false);
      setIsPaused(false);
      setIsStarted(true); // Bloquea todo
    } catch (e) {
      console.error("Error al iniciar:", e);
      pushLog(`ERROR al iniciar: ${String(e)}`);
    }
  };

  const handlePause = async () => {
    if (isPauseDisabled) return;

    try {
      await programManager.pauseProgram();
      setIsPaused(true);
      pushLog("PAUSE enviado al robot");
    } catch (e) {
      console.error("Error al pausar:", e);
      pushLog(`ERROR al pausar: ${String(e)}`);
    }
  };

  const handleContinue = async () => {
    if (isPauseDisabled) return;

    try {
      await programManager.resumeProgram();
      setIsPaused(false);
      pushLog("CONTINUE enviado al robot");
    } catch (e) {
      console.error("Error al continuar:", e);
      pushLog(`ERROR al continuar: ${String(e)}`);
    }
  };

  const handleStop = async () => {
    if (isStopDisabled) return;

    try {
      await programManager.stopProgram(ProgramStopType.QUICK);
      setIsPaused(false);
      setIsStarted(false); // Desbloquea configuración
      pushLog("STOP rápido enviado al robot");
    } catch (e) {
      console.error("Error al detener:", e);
      pushLog(`ERROR al detener: ${String(e)}`);
    }
  };

  const handleGoHome = () => {
    if (isGoHomeDisabled) return;
    console.log("GO HOME ejecutado");
    pushLog("GO HOME presionado");
    // Aquí en futuro puedes llamar a un DRL de homing o similar
  };

  const handleResetLeft = () => {
    if (isStarted) return;
    setLeftLayer(1);
    setLeftSlot(1);
    setConfigSentToPLC(false);
    pushLog("Reset LEFT ejecutado");
  };

  const handleResetRight = () => {
    if (isStarted) return;
    setRightLayer(1);
    setRightSlot(1);
    setConfigSentToPLC(false);
    pushLog("Reset RIGHT ejecutado");
  };

  const handleChangeLeftEnabled = (value: boolean) => {
    setLeftEnabled(value);
    setConfigSentToPLC(false);
  };

  const handleChangeRightEnabled = (value: boolean) => {
    setRightEnabled(value);
    setConfigSentToPLC(false);
  };

  const handleChangeLeftLayer = (value: number) => {
    setLeftLayer(value);
    setConfigSentToPLC(false);
  };

  const handleChangeLeftSlot = (value: number) => {
    setLeftSlot(value);
    setConfigSentToPLC(false);
  };

  const handleChangeRightLayer = (value: number) => {
    setRightLayer(value);
    setConfigSentToPLC(false);
  };

  const handleChangeRightSlot = (value: number) => {
    setRightSlot(value);
    setConfigSentToPLC(false);
  };

  // ============================
  // SET CONFIG → ESCRIBIR A PLC
  // ============================

  const handleSetConfigToPLC = async () => {
    if (isSetConfigDisabled) return;

    if (!industrialEthernet) {
      console.error(
        "[HMI] No hay instancia de industrialEthernet, no puedo escribir GPR."
      );
      pushLog(
        "ERROR: industrialEthernet no disponible, no se envió config al PLC"
      );
      return;
    }

    // 0 = left, 1 = right, 2 = both
    const sideCode =
      selectedSide === "left"
        ? 0
        : selectedSide === "right"
        ? 1
        : selectedSide === "both"
        ? 2
        : -1;

    if (sideCode < 0) {
      console.warn("SET CONFIG → Config inválida (sideCode < 0)");
      pushLog("WARN: intento de SET CONFIG con configuración inválida");
      return;
    }

    const leftEnabledInt = leftEnabled ? 1 : 0;
    const rightEnabledInt = rightEnabled ? 1 : 0;

    console.log("[HMI] SET CONFIG → valores calculados:", {
      selectedSide,
      sideCode,
      leftEnabledInt,
      leftLayer,
      leftSlot,
      rightEnabledInt,
      rightLayer,
      rightSlot,
    });

    pushLog(
      `SET CONFIG → side=${sideCode}, L[en=${leftEnabledInt}, layer=${leftLayer}, slot=${leftSlot}], R[en=${rightEnabledInt}, layer=${rightLayer}, slot=${rightSlot}]`
    );

    try {
      // BITs
      const p1 = industrialEthernet.setOutputRegister(
        IEGprDataType.BIT,
        GPR_BOOL_LEFT_ENABLED,
        leftEnabledInt.toString()
      );
      const p2 = industrialEthernet.setOutputRegister(
        IEGprDataType.BIT,
        GPR_BOOL_RIGHT_ENABLED,
        rightEnabledInt.toString()
      );

      // INTs
      const p3 = industrialEthernet.setOutputRegister(
        IEGprDataType.INT,
        GPR_INT_SIDE_CODE,
        sideCode.toString()
      );
      const p4 = industrialEthernet.setOutputRegister(
        IEGprDataType.INT,
        GPR_INT_LEFT_LAYER,
        leftLayer.toString()
      );
      const p5 = industrialEthernet.setOutputRegister(
        IEGprDataType.INT,
        GPR_INT_LEFT_SLOT,
        leftSlot.toString()
      );
      const p6 = industrialEthernet.setOutputRegister(
        IEGprDataType.INT,
        GPR_INT_RIGHT_LAYER,
        rightLayer.toString()
      );
      const p7 = industrialEthernet.setOutputRegister(
        IEGprDataType.INT,
        GPR_INT_RIGHT_SLOT,
        rightSlot.toString()
      );

      const results = await Promise.all([p1, p2, p3, p4, p5, p6, p7]);

      console.log(
        "[HMI] SET CONFIG → setOutputRegister resultados:",
        results
      );
      setConfigSentToPLC(true);
      pushLog("CONFIG enviada correctamente al PLC");
    } catch (err) {
      console.error(
        "Error al mandar config al PLC vía IndustrialEthernet:",
        err
      );
      pushLog(`ERROR al mandar config al PLC: ${String(err)}`);
      setConfigSentToPLC(false);
    }
  };

  // ============================
  // RENDER
  // ============================

  return (
    <div className={styles.mainContainer}>
      <PalletStatePanel
        leftEnabled={leftEnabled}
        rightEnabled={rightEnabled}
        onChangeLeftEnabled={handleChangeLeftEnabled}
        onChangeRightEnabled={handleChangeRightEnabled}
        leftLayer={leftLayer}
        leftSlot={leftSlot}
        rightLayer={rightLayer}
        rightSlot={rightSlot}
        onChangeLeftLayer={handleChangeLeftLayer}
        onChangeLeftSlot={handleChangeLeftSlot}
        onChangeRightLayer={handleChangeRightLayer}
        onChangeRightSlot={handleChangeRightSlot}
        onResetLeft={handleResetLeft}
        onResetRight={handleResetRight}
        leftPalletDetected={leftPalletDetected}
        rightPalletDetected={rightPalletDetected}
        configDisabled={isStarted}
        leftMaxLayers={MAX_LAYERS}
        leftMaxSlots={MAX_SLOTS}
        rightMaxLayers={MAX_LAYERS}
        rightMaxSlots={MAX_SLOTS}
        onSetConfig={handleSetConfigToPLC}
        isSetDisabled={isSetConfigDisabled}
        lockInputs={configSentToPLC}
      />

      <div className={styles.controlCard}>
        <div className={styles.controlCardHeader}>
          Palletizing control
        </div>
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
            isGoHomeDisabled={isGoHomeDisabled}
          />
        </div>
      </div>

      {/* LOG PANEL */}
      <div className={styles.logCardWrapper}>
        <div className={styles.logCard}>
          <div className={styles.logCardHeader}>Event log</div>
          <div className={styles.logCardBody}>
            {logs.length === 0 ? (
              <div className={styles.logEmpty}>No events yet.</div>
            ) : (
              <ul className={styles.logList}>
                {logs.map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
