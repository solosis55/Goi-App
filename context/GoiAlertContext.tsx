import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { GoiConfirmSheet, type GoiConfirmButton } from "../components/GoiConfirmSheet";

const goiAlertRef: { current: ((options: GoiAlertOptions) => void) | null } = {
  current: null,
};

export type GoiAlertOptions = {
  title: string;
  message?: string;
  buttons: GoiConfirmButton[];
};

type GoiAlertContextValue = {
  showAlert: (options: GoiAlertOptions) => void;
};

const GoiAlertContext = createContext<GoiAlertContextValue | null>(null);

const CLOSED: GoiAlertOptions & { visible: boolean } = {
  visible: false,
  title: "",
  message: undefined,
  buttons: [],
};

export function GoiAlertProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(CLOSED);

  const dismiss = useCallback(() => {
    setState(CLOSED);
  }, []);

  const showAlert = useCallback((options: GoiAlertOptions) => {
    setState({ visible: true, ...options });
  }, []);

  useEffect(() => {
    goiAlertRef.current = showAlert;
    return () => {
      goiAlertRef.current = null;
    };
  }, [showAlert]);

  const value = useMemo(() => ({ showAlert }), [showAlert]);

  return (
    <GoiAlertContext.Provider value={value}>
      {children}
      <GoiConfirmSheet
        visible={state.visible}
        title={state.title}
        message={state.message}
        buttons={state.buttons}
        onDismiss={dismiss}
      />
    </GoiAlertContext.Provider>
  );
}

export function useGoiAlert(): GoiAlertContextValue {
  const ctx = useContext(GoiAlertContext);
  if (!ctx) {
    throw new Error("useGoiAlert debe usarse dentro de GoiAlertProvider");
  }
  return ctx;
}

/** Para módulos fuera de React (utils, callbacks async). */
export function goiAlert(options: GoiAlertOptions): void {
  goiAlertRef.current?.(options);
}
