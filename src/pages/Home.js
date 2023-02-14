/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from "react";
import { Chart } from "primereact/chart";
import { useFetch } from "../hooks/use-fetch";
import { getIotPassiveDeviceCount, getIotProductCount, getIotProductErrorCount, getIotProductErrorDateCount, getIotProductFireCount, getIotProductFireDateCount, getIotActiveDeviceCount } from "../service/report";
import { LoadingContext } from "../context/Loading";
import { formatDate } from "@fullcalendar/core";
import { Button, Column, DataTable, Tag } from "primereact";
import { AppContext } from "../context/AppContext";
import { Link, useHistory } from "react-router-dom";
import pageURL from "../utils/pageUrls";
import { tryCatch } from "@thalesrc/js-utils";
import { closePastAlarm, getMalfuntionedProducts } from "../service/product-iot";
import ActionButtons from "../components/ActionButtons";
import { Authority } from "../utils/authority";

export default function Home() {
  const { setLoading } = useContext(LoadingContext);
  const { store, actions } = useContext(AppContext);
  let history = useHistory();

  const [fireData, setFireData] = useState();
  const [errorData, setErrorData] = useState();

  let basicOptions = {
    maintainAspectRatio: false,
    aspectRatio: 0.5,
    plugins: {
      legend: {
        labels: {
          color: "#495057",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#495057",
        },
        grid: {
          color: "#ebedef",
        },
      },
      y: {
        ticks: {
          color: "#495057",
        },
        grid: {
          color: "#ebedef",
        },
      },
    },
    y: {
      suggestedMin: 0,
      suggestedMax: 20,
    },
  };

  const [iotProductCount] = useFetch(() => getIotProductCount(), [], {});
  const [iotPassiveCount] = useFetch(() => getIotPassiveDeviceCount(), [], {});
  const [iotActiveCount] = useFetch(() => getIotActiveDeviceCount(), [], {});
  const [iotProductErrorCount] = useFetch(() => getIotProductErrorCount(), [], {});
  const [iotProductFireCount] = useFetch(() => getIotProductFireCount(), [], {});
  const [iotProductFireDateCount] = useFetch(() => getIotProductFireDateCount(), [], {});
  const [iotProductErrorDateCount] = useFetch(() => getIotProductErrorDateCount(), [], { setLoading });

  useEffect(() => {
    setFireData({
      labels: iotProductFireDateCount.map((item) => formatDate(item.date, { locale: "tr" })),
      datasets: [
        {
          label: "Yangın Sayısı",
          data: iotProductFireDateCount.map((item) => item.count),
          fill: true,
          backgroundColor: "#d9342b",
          tension: 0.4,
        },
      ],
    });
    setErrorData({
      labels: iotProductErrorDateCount.map((item) => formatDate(item.date, { locale: "tr" })),
      datasets: [
        {
          label: "Hata Sayısı",
          data: iotProductErrorDateCount.map((item) => item.count),
          fill: true,
          backgroundColor: "#eab308",
          tension: 0.4,
        },
      ],
    });
  }, [iotProductFireDateCount, iotProductErrorDateCount]);

  const bodyStatus = (rowData) => {
    switch (rowData.signalTypeName) {
      case "Yangın":
        return <Tag className="text-xs" severity="danger" value={rowData.signalTypeName}></Tag>;
      case "Hata":
        return <Tag className="text-xs" severity="warning" value={rowData.signalTypeName}></Tag>;
      case "Hata Geçti":
        return <Tag className="text-xs" severity="info" value={rowData.signalTypeName}></Tag>;
      case "Yangın Geçti":
        return <Tag className="text-xs" severity="success" value={rowData.signalTypeName}></Tag>;
      default:
        break;
    }
  };

  const handleCloseAlarm = async (rowData) => {
    const [err] = await tryCatch(closePastAlarm(rowData.id));

    if (err) return;

    const [, malfuntioned] = await tryCatch(getMalfuntionedProducts());

    actions.setMalfuntioned(malfuntioned);
  };

  const rowClass = (data) => {
    switch (data.signalTypeName) {
      case "Yangın":
        return "danger";
      case "Hata":
        return "warning";
      case "Hata Geçti":
        return "info";
      case "Yangın Geçti":
        return "success";
      default:
        break;
    }
  };

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <div className="grid">
            <div className="col-12 md:col-9 lg:col-9">
              <DataTable className="active-alarms" header="Aktif Hatalar ve Yangınlar" rowClassName={rowClass} value={store.malfuntioned} showGridlines rows={50} dataKey="id" filterDisplay="menu" responsiveLayout="scroll" emptyMessage="Veri bulunmamaktadır.">
                <Column sortable field="imei" header="İmei" style={{ minWidth: "12rem" }} />
                <Column sortable field="locationName" header="Mahal Adı" style={{ minWidth: "12rem" }} />
                <Column sortable field="signalTypeName" header="Sinyal Tipi" body={(rowData) => bodyStatus(rowData)} />
                <Column sortable field="dateTime" header="Tarih" style={{ minWidth: "8rem" }} body={(rowData) => formatDate(rowData.dateTime, { locale: "tr", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })} />
                <Column
                  header="Aksiyon"
                  headerStyle={{ width: "15rem", textAlign: "center" }}
                  bodyStyle={{ textAlign: "center", overflow: "visible" }}
                  body={(rowData) => {
                    if (rowData.signalTypeName === "Hata Geçti" || rowData.signalTypeName === "Yangın Geçti") {
                      return (
                        <ActionButtons className="flex justify-content-center align-items-center" style={{ gap: "10px" }}>
                          <Button code={Authority.TurnOffAlarm} className="p-button-sm p-button-secondary text-xs" type="button" label="Kapat" onClick={() => handleCloseAlarm(rowData)} />
                          <Button code={Authority.Home} className="p-button-sm text-xs" type="button" label="Detaya Git" onClick={() => history.push(pageURL.deviceLog + "/" + rowData.locationId)} />
                        </ActionButtons>
                      );
                    } else {
                      return <Button type="button" label="Detaya Git" onClick={() => history.push(pageURL.deviceLog + "/" + rowData.locationId)} />;
                    }
                  }}
                />
              </DataTable>
            </div>
            <div className="col-12 md:col-3 lg:col-3">
              <div className="col-12 card">
                <div className="flex justify-content-between align-items-center">
                  <div className="flex mr-2 align-items-center justify-content-center bg-blue-100 border-round" style={{ width: "2.5rem", height: "2.5rem" }}>
                    <i className="pi pi-database text-blue-500 text-xl"></i>
                  </div>
                  <div>
                    <span className="block text-500 font-medium">Toplam IOT Cihaz Sayısı</span>
                  </div>
                  <div className="text-900 font-medium text-xl">{iotProductCount}</div>
                </div>
              </div>
              <div className="col-12 card">
                <div className="flex justify-content-between align-items-center">
                  <div className="flex mr-2 align-items-center justify-content-center bg-orange-100 border-round" style={{ width: "2.5rem", height: "2.5rem" }}>
                    <i className="pi pi-times-circle text-yellow-500 text-xl"></i>
                  </div>
                  <div>
                    <span className="block text-500 font-medium">Toplam Hata Sayısı (24 Saat)</span>
                  </div>
                  <div className="text-900 font-medium text-xl">{iotProductErrorCount}</div>
                </div>
              </div>
              <div className="col-12 card">
                <div className="flex justify-content-between align-items-center">
                  <div className="flex mr-2 align-items-center justify-content-center bg-cyan-100 border-round" style={{ width: "2.5rem", height: "2.5rem" }}>
                    <i className="pi pi-bell text-red-500 text-xl"></i>
                  </div>
                  <div>
                    <span className="block text-500 font-medium">Toplam Yangın Sayısı (24 Saat)</span>
                  </div>
                  <div className="text-900 font-medium text-xl">{iotProductFireCount}</div>
                </div>
              </div>
              <Link
                to={{
                  pathname: "/device-log",
                  state: { filter: 3 },
                }}
              >
                <div className="col-12 card">
                  <div className="flex justify-content-between align-items-center">
                    <div className="flex mr-2 align-items-center justify-content-center bg-blue-100 border-round" style={{ width: "2.5rem", height: "2.5rem" }}>
                      <i className="pi pi-power-off text-blue-500 text-xl"></i>
                    </div>
                    <div>
                      <span className="block text-500 font-medium">Toplam Pasif Cihaz Sayısı</span>
                    </div>
                    <div className="text-900 font-medium text-xl">{iotPassiveCount}</div>
                  </div>
                </div>
              </Link>
              <Link
                to={{
                  pathname: "/device-log",
                  state: { filter: 4 },
                }}
              >
                <div className="col-12 card">
                  <div className="flex justify-content-between align-items-center">
                    <div className="flex mr-2 align-items-center justify-content-center bg-green-100 border-round" style={{ width: "2.5rem", height: "2.5rem" }}>
                      <i className="pi pi-eye text-green-500 text-xl"></i>
                    </div>
                    <div>
                      <span className="block text-500 font-medium">Toplam Aktif Cihaz Sayısı</span>
                    </div>
                    <div className="text-900 font-medium text-xl">{iotActiveCount}</div>
                  </div>
                </div>
              </Link>
              <div className="col-12 card">
                <h5 className="text-center">Son 7 Günlük Yangın Alarm Grafiği</h5>
                <Chart type="bar" data={fireData} options={basicOptions} style={{ height: "300px" }} />
              </div>
              <div className="col-12 card">
                <h5 className="text-center">Son 7 Günlük Hata İkaz Grafiği</h5>
                <Chart type="bar" data={errorData} options={basicOptions} style={{ height: "300px" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
