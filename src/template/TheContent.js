/* eslint-disable react-hooks/exhaustive-deps */
import { HubConnectionBuilder } from "@microsoft/signalr";
import { Button } from "primereact/button";
import React, { useContext, useEffect, useState } from "react";
import { Route, useHistory } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { ToasterContext } from "../context/ToasterContext";
import routes from "../routes";
import pageURL from "../utils/pageUrls";
import { AlarmContext } from "../context/Alarm";
import { UserContext } from "../context/UserContext";
import { getIotHeartbeat, getMalfuntionedProducts } from "../service/product-iot";
import { AppContext } from "../context/AppContext";
import { Dialog } from "primereact/dialog";
import { useDialogState } from "../hooks/use-dialog-state";
import { getLocationDetail } from "../service/location";
import { tryCatch } from "@thalesrc/js-utils";
import { useFetch } from "../hooks/use-fetch";
import { formatDate } from "@fullcalendar/core";

export const PulseAnimateButton = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(174, 49, 15, 0.4);
  }
  50% {
    box-shadow: 0 0 0 15px rgba(174, 49, 15, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(174, 49, 15, 0);
  }
`;

const Siren = styled.div`
  .info{
      margin: 20px;
      padding: 10px;
      animation: ${PulseAnimateButton} ease 2s infinite};
    }
`;

const ToastContent = styled.div`
  flex: 1;

  #content{
    padding: 5px;
    margin-bottom: 5px;
    animation: ${PulseAnimateButton} ease 2s infinite};
  }
`;

const TheContent = () => {
  const [connection, setConnection] = useState(null);
  const { openToaster } = useContext(ToasterContext);
  const { actions } = useContext(AppContext);
  const { user } = useContext(UserContext);
  const { alarmPlay, isPlaying, alarmStop } = useContext(AlarmContext);
  const [alert, setAlert] = useState("");
  const [opened, open, close] = useDialogState();

  let history = useHistory();

  let type = { 1: "Yangın", 2: "Hata", 3: "Yangın Geçti", 4: "Hata Geçti" };
  let severity = { 1: "error", 2: "warn", 3: "success", 4: "info" };

  const renderToast = (res) => {
    openToaster("bottom-right", {
      severity: severity[res?.signalTypeId],
      summary: type[res?.signalTypeId],
      detail: res?.imei,
      sticky: true,
      content: (
        <ToastContent className="flex flex-column">
          <div id="content" className="text-center">
            İmei:{res.imei} - {type[res.signalTypeId]}
            <p className="font-bold m-0">Mahal:{res.locationName}</p>
            <p className="m-0">Tarih:{formatDate(new Date(), { locale: "tr", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}</p>
          </div>
          <div className="grid p-fluid mt-3">
            <Button type="button" label="Detaya git" onClick={() => handleDetail(res.locationId)} />
          </div>
        </ToastContent>
      ),
    });
  };

  const [malfuntioned, reloadMalFutioned] = useFetch(() => getMalfuntionedProducts(), [], { reloadDeps: [], deps: [] });

  useEffect(() => {
    actions.setMalfuntioned(malfuntioned);
  }, [malfuntioned]);

  useEffect(async () => {
    const newConnection = new HubConnectionBuilder().withUrl(process.env.REACT_APP_HUB_URL).withAutomaticReconnect().build();
    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log("Connected!");
          connection.on("ServertoHub", async (res) => {
            await getIotHeartbeat(res.locationId)
              .then((iots) => actions.setIotProducts(iots))
              .catch((err) => console.log(err));

            const [, locationDetail] = await tryCatch(getLocationDetail(res.locationId));
            setAlert({ ...res, ...locationDetail });
          });
        })
        .catch((e) => console.log("Connection failed: ", e));
    }
  }, [connection]);

  useEffect(() => {
    if (alert && user?.locations?.map((item) => item.key).includes(alert.locationId)) {
      const payload = { ...alert, type: type[alert.signalTypeId], severity: severity[alert.signalTypeId] };
      actions.setAlert(payload);
      actions.setMalfuntioned(reloadMalFutioned());

      if (!isPlaying && (alert.signalTypeId === 1 || alert.signalTypeId === 2)) {
        open();
        alarmPlay();
      }
      // renderToast(alert);
    }
  }, [alert, user]);

  const handleDetail = (locationId) => {
    history.push(pageURL.deviceLog + "/" + locationId);
    close();
  };

  const gotoHome = () => {
    history.push(pageURL.home);
    alarmStop();
    close();
  };

  return (
    <div className="layout-main-container">
      <div className="layout-main">
        {routes.map((route, idx) => {
          return route.component && <Route key={idx} path={route.path} exact={route.exact} name={route.name} component={route.component} />;
        })}
        <Dialog
          header={type[alert.signalTypeId]}
          className="siren-dialog"
          visible={opened}
          onHide={() => {
            gotoHome();
          }}
        >
          <Siren>
            <div className="flex flex-column justify-content-center align-content-center content">
              <img src={alert.signalTypeId === 2 || alert.signalTypeId === 4 ? "/warning.gif" : "/alert.gif"} alt="alarm"></img>
              <div className="info">
                <h3 className="m-0">
                  İmei:{alert.imei} - {type[alert.signalTypeId]} - {alert.name}
                </h3>
                <p className="m-0">Tarih:{formatDate(new Date(), { locale: "tr", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}</p>
              </div>
              <Button className="mt-1 w-full border-none border-noround" type="button" label="Detaya git" onClick={() => gotoHome()} />
            </div>
          </Siren>
        </Dialog>
      </div>
    </div>
  );
};

export default TheContent;
