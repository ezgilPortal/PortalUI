/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useMemo, useState } from "react";

export const AppContext = createContext();

export function AppContextProvider({ children }) {
  const [store, setStore] = useState({
    mode: "light",
    iotProducts: [],
    alert: "",
    malfuntioned: []
  });

  const [actions, setActions] = useState({
    changeTheme: (mode) => setStore((prev) => ({ ...prev, mode: mode })),
    setIotProducts: (payload) => setStore((prev) => ({ ...prev, iotProducts: payload })),
    setAlert: (payload) => setStore((prev) => ({ ...prev, alert: payload })),
    setMalfuntioned: (payload) => setStore((prev) => ({ ...prev, malfuntioned: payload })),
  });

  const context = useMemo(() => ({ store, setStore, actions, setActions }), [store, setStore, actions, setActions]);

  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
}
