import React, { createContext, useCallback, useMemo, useState, useRef } from "react";
import { Toast } from "primereact/toast";

export const ToasterContext = createContext(null);

export function ToasterContextProvider({ children }) {
  const toast = useRef(null);
  const [toasterPosition, setToasterPosition] = useState(null);

  const openToaster = useCallback((position, body = {}) => {
    setToasterPosition(position);
    toast.current.show(body);
  }, []);

  const closeToaster = useCallback(() => {
    setToasterPosition(null);
    toast.current.clear();
  }, []);

  const context = useMemo(() => ({ openToaster, closeToaster }), [openToaster, closeToaster]);

  return (
    <>
      <ToasterContext.Provider value={context}>{children}</ToasterContext.Provider>
      <Toast ref={toast} position={toasterPosition} closable="true"></Toast>
    </>
  );
}
