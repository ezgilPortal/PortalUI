/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useStateStorage } from "../hooks/use-state-storage";
import { ToasterContext } from "./ToasterContext";
import { loginUser, getCustomer } from "../service/auth";
import { useHistory } from "react-router-dom";
import { LoadingContext } from "./Loading";
import pageURL from "../utils/pageUrls";
import { tryCatch } from "@thalesrc/js-utils";

export const UserContext = createContext(null);

export function UserContextProvider({ children }) {
  let history = useHistory();
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const [user, setUser] = useState(null);
  const { openToaster } = useContext(ToasterContext);
  const [token, setToken, removeToken] = useStateStorage("token");

  useEffect(async () => {
    if (localStorage.getItem("token")) {
      const [err, res] = await tryCatch(getCustomer());

      if (err) {
        removeToken("token");
        setUser(false);
        hideLoading();
        history.push(pageURL.home);
        return;
      }

      setUser(res);
      hideLoading();
    } else {
      setUser(false);
    }
  }, [history, removeToken]);

  const login = useCallback(
    async (payload) => {
      showLoading();

      const [err, res] = await tryCatch(loginUser(payload));
      if (err) {
        openToaster("top-right", { severity: "error", summary: err?.response?.data?.httpStatusCodeName, detail: err?.response?.data?.message, life: 3000 });
        hideLoading();
      }

      setUser(res);
      setToken(res.token);
      history.push(pageURL.home);
      hideLoading();
    },
    [hideLoading, history, setToken, showLoading]
  );

  const logout = useCallback(() => {
    removeToken("token");
    setUser(false);
    history.push(pageURL.login);
  }, [history, removeToken]);

  const context = useMemo(() => ({ user, token, login, logout, setUser }), [user, token, login, logout, setUser]);

  return <UserContext.Provider value={context}>{children}</UserContext.Provider>;
}
