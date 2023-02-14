/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from "react";
import * as dayjs from "dayjs";
import { ListBox } from "primereact/listbox";
import { useFetch } from "../hooks/use-fetch";
import { getlocationAllItems, getLocationDetail } from "../service/location";
import CustomDropdown from "../components/Dropdown";
import { getFormErrorMessage } from "../utils/formikErrorCheck";
import { LoadingContext } from "../context/Loading";
import { useFormik } from "formik";
import { getIotHeartbeat } from "../service/product-iot";
import { useHistory, useParams } from "react-router-dom";
import pageURL from "../utils/pageUrls";
import { AlarmContext } from "../context/Alarm";
import { Button } from "primereact/button";
import { PulseAnimateButton } from "../template/TheContent";
import styled, { css } from "styled-components";
import { AppContext } from "../context/AppContext";
import { formatDate } from "@fullcalendar/core";
import { generateChild } from "../utils/generateChild";
import { SelectButton } from "primereact";
import { useLocation } from "react-router-dom";

const animationCss = css`
  animation: ${PulseAnimateButton} ease 2s infinite;
`;

const Mute = styled.div`
  .muteBtn {
    animation: animationCss;
  }
`;

const LocationInfo = styled.div`
  ${(props) => (props.isPlaying ? animationCss : "")};
`;

const ListItem = styled.div`
  ${(props) => (props.lastSignalType === 1 ? animationCss : "")};
`;

export default function DeviceLog() {
  const { id } = useParams();
  let history = useHistory();
  const { setLoading } = useContext(LoadingContext);
  const { alarmStop, isPlaying } = useContext(AlarmContext);
  const { store, actions } = useContext(AppContext);
  const [filter, setFilter] = useState(6);
  const [list, setList] = useState([]);
  const [locationSelectedItems] = useFetch(() => getlocationAllItems(), [], { setLoading, reloadDeps: [], deps: [] });
  const { state } = useLocation();

  const filterOptions = [
    { name: "Yangın", value: 1 },
    { name: "Hata", value: 2 },
    { name: "Pasif", value: 3 },
    { name: "Aktif", value: 4 },
    { name: "Veri yok", value: 5 },
    { name: "Tümü", value: 6 },
  ];

  const formik = useFormik({
    initialValues: {
      locationId: "",
    },
    validate: (values) => {
      const errors = {};

      if (!values.locationId) {
        errors.locationId = "Lütfen mahal seçiniz.";
      }

      return errors;
    },
    onSubmit: async () => {},
  });

  const [iotHeartBeats] = useFetch(formik.values?.locationId ? () => getIotHeartbeat(formik.values.locationId) : {}, [], { reloadDeps: [formik.values.locationId, formik.values.timer], deps: [formik.values.locationId, formik.values.timer] });
  const [localationDetail] = useFetch(() => (formik.values?.locationId ? getLocationDetail(formik.values?.locationId) : {}), [], { reloadDeps: [formik.values.locationId, formik.values.timer], deps: [formik.values.locationId, formik.values.timer] });

  useEffect(() => {
    if (store) {
      if (state) {
        handleFilter(state.filter);
        history.replace({ ...history.location, state: undefined });
      } else {
        handleFilter(filter);
      }
    }
  }, [store]);

  useEffect(() => {
    if (id) {
      formik.setValues({
        locationId: Number(id),
      });
    } else {
      formik.setValues({
        locationId: locationSelectedItems[0]?.id,
      });
    }

    const intervalId = setInterval(() => {
      formik.setFieldValue("timer", dayjs().format("HH:mm:ss"));
    }, 10000);

    return () => clearInterval(intervalId);
  }, [locationSelectedItems, id]);

  useEffect(() => {
    actions.setIotProducts(iotHeartBeats);
  }, [iotHeartBeats]);

  const itemTemplate = (option) => {
    let color = "";
    let label = "";
    let lastSignalType = "";

    if (!option.lastHeartBeatDate) {
      color = "--blue-500";
      label = "Veri Yok";
    } else {
      if (option.lastSignalType === 1) {
        color = "--red-600";
        label = "Yangın";
        lastSignalType = 1;
      } else if (option.lastSignalType === 2) {
        color = "--yellow-400";
        label = "Hata";
      } else {
        const now = dayjs();
        const date2 = dayjs(option.lastHeartBeatDate);
        if (now.diff(date2, "second") > option.heartBeatPeriod) {
          color = "--gray-500";
          label = "Pasif";
        } else {
          color = "--green-600";
          label = "Aktif";
        }
      }
    }

    return (
      <ListItem lastSignalType={lastSignalType} style={{ color: `var(${color})` }}>
        {option.imei} - {label} - <b>{option.locationName}</b> {option.lastHeartBeatDate && `- ${formatDate(option.lastHeartBeatDate, { locale: "tr", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}`}
      </ListItem>
    );
  };

  const handleLocationChange = (e) => {
    formik.setFieldValue("locationId", e.value);
    history.push(pageURL.deviceLog + "/" + e.value);
  };

  const renderFile = (fileUrl) => {
    var path = new RegExp(".pdf$");

    let isPdf = false;

    if (fileUrl) {
      if (path.test(fileUrl)) {
        isPdf = true;
      }
    }

    return (
      <LocationInfo isPlaying={isPlaying} className="border-round-sm flex justify-content-center align-items-center" style={{ height: "100%" }}>
        {fileUrl ? isPdf ? <iframe title="pdf" src={fileUrl} className="w-full" style={{ minHeight: "1000px" }} /> : <img className="w-full" alt="" src={fileUrl}></img> : "Görsel Bulunamadı"}
      </LocationInfo>
    );
  };

  const handleFilter = (value) => {
    setFilter(value);

    switch (value) {
      case 5:
        setList(store?.iotProducts?.filter((item) => !item.lastHeartBeatDate));
        break;
      case 4:
        setList(
          store?.iotProducts?.filter((item) => {
            const now = dayjs();
            const date2 = dayjs(item.lastHeartBeatDate);

            if (now.diff(date2, "second") < item.heartBeatPeriod && item.lastHeartBeatDate && item.lastSignalType !== 2 && item.lastSignalType !== 1) {
              return item;
            }
          })
        );
        break;
      case 3:
        setList(
          store?.iotProducts?.filter((item) => {
            const now = dayjs();
            const date2 = dayjs(item.lastHeartBeatDate);

            if ((now.diff(date2, "second") > item.heartBeatPeriod) && item.lastHeartBeatDate &&  item.lastSignalType !== 2 && item.lastSignalType !== 1) {
              return item;
            }
          })
        );
        break;
      case 2:
        setList(store?.iotProducts?.filter((item) => item.lastSignalType === 2 && item.lastHeartBeatDate));
        break;
      case 1:
        setList(store?.iotProducts?.filter((item) => item.lastSignalType === 1 && item.lastHeartBeatDate));
        break;
      case 6:
        setList(store?.iotProducts);
        break;
      default:
        setList(store?.iotProducts);
        break;
    }
  };

  const handleChange = (value) => {
    history.push(pageURL.deviceLog + "/" + value.locationId);
  };

  return (
    <>
      <div className="grid">
        <div className="col-12">
          <div className="card">
            <div className="grid">
              <div className="col-12 md:col-3">
                <p className="p-error">*Bilgilendirme</p>
                <ul>
                  <li style={{ color: "var(--red-600)" }}>Yangın-kırmızı</li>
                  <li style={{ color: "var(--yellow-400)" }}>Hata-sarı</li>
                  <li style={{ color: "var(--gray-900)" }}>Pasif-siyah</li>
                  <li style={{ color: "var(--green-600)" }}>Aktif-yeşil</li>
                  <li style={{ color: "var(--blue-600)" }}>Veri yok-mavi</li>
                </ul>
              </div>
              <div className="col-12 md:col-9 flex justify-content-center align-items-center">
                {isPlaying && (store.alert.signalTypeId === 1 || store.alert.signalTypeId === 2) && (
                  <ul style={{ listStyleType: "none" }}>
                    <li>
                      <h1>Mahal: {localationDetail.name}</h1>
                    </li>
                    <li>
                      <h1>IMEI: {store.alert?.imei}</h1>
                    </li>
                    <li>
                      <h1>{store.alert?.type}</h1>
                    </li>
                  </ul>
                )}
              </div>
              {isPlaying && (
                <Mute className="field col-12">
                  <Button type="button" className="p-button-danger w-full p-button-lg muteBtn" label="Sustur" onClick={() => alarmStop()} />
                </Mute>
              )}
              <div className="col-12 pt-5">
                <CustomDropdown
                  className="w-full"
                  label="Mahal Seçiniz"
                  errorMsg={getFormErrorMessage(formik, "locationId")}
                  options={generateChild(locationSelectedItems)}
                  type="tree"
                  optionLabel="value"
                  optionValue="key"
                  name="locationId"
                  inputId="locationId"
                  value={formik.values.locationId}
                  onChange={(e) => handleLocationChange(e)}
                />
              </div>
              <div className="filter col-12">
                <SelectButton className="mb-3" value={filter} options={filterOptions} onChange={(e) => handleFilter(e.value)} optionLabel="name" />
              </div>
              <div className="field col-12 md:col-4">
                <ListBox onChange={(e) => handleChange(e.value)} options={list} multiple={false} itemTemplate={itemTemplate} listStyle={{ minHeight: "250px" }} />
              </div>
              <div className="field col-12 md:col-8">{renderFile(localationDetail?.fileUrl)}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
