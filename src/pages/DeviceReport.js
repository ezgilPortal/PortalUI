/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect } from "react";
import { useFetch } from "../hooks/use-fetch";
import { getlocationAllItems, getLocationDetail } from "../service/location";
import CustomDropdown from "../components/Dropdown";
import { getFormErrorMessage } from "../utils/formikErrorCheck";
import { LoadingContext } from "../context/Loading";
import { useFormik } from "formik";
import { getAlarmLogs, getIotHeartbeat } from "../service/product-iot";
import { useParams } from "react-router-dom";
import { AlarmContext } from "../context/Alarm";
import { Button } from "primereact/button";
import styled from "styled-components";
import { AppContext } from "../context/AppContext";
import CustomCalendar from "../components/CustomCalendar";
import { tryCatch } from "@thalesrc/js-utils";
import { ToasterContext } from "../context/ToasterContext";
import { exportExcel } from "../utils/exportExcel";
import { formatDate } from "@fullcalendar/core";
import { generateChild } from "../utils/generateChild";
import { Column, DataTable } from "primereact";

const LocationInfo = styled.div``;

export default function DeviceLog() {
  const { id } = useParams();
  const { setLoading, showLoading, hideLoading } = useContext(LoadingContext);
  const { isPlaying } = useContext(AlarmContext);
  const { store, actions } = useContext(AppContext);
  const { openToaster } = useContext(ToasterContext);

  const [locationSelectedItems] = useFetch(() => getlocationAllItems(), [], { setLoading, reloadDeps: [], deps: [] });

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

  const [localationDetail] = useFetch(() => (formik.values?.locationId ? getLocationDetail(formik.values?.locationId) : {}), [], { reloadDeps: [formik.values.locationId], deps: [formik.values.locationId] });
  const [iotHeartBeats] = useFetch(formik.values?.locationId ? () => getIotHeartbeat(formik.values.locationId) : {}, [], { reloadDeps: [formik.values.locationId], deps: [formik.values.locationId] });

  useEffect(() => {
    actions.setIotProducts(iotHeartBeats);
  }, [iotHeartBeats]);

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
  }, [locationSelectedItems, id]);

  const handleLocationChange = (e) => {
    formik.setFieldValue("locationId", e.value);
    // history.push(pageURL.deviceReport + "/" + e.value);
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

  const logFormik = useFormik({
    initialValues: {
      startDate: "",
      endDate: "",
    },
    validate: (values) => {
      const errors = {};

      if (!values.startDate) {
        errors.startDate = "Lütfen başlangıç tarihi seçiniz.";
      }

      if (!values.endDate) {
        errors.endDate = "Lütfen bitiş tarihi seçiniz.";
      }

      return errors;
    },
    onSubmit: async (data) => {
      showLoading();
      const { startDate, endDate } = data;

      let start = formatDate(startDate, { timeZone: "local", month: "2-digit", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", meridiem: false, hour12: false }).replace(/\s24+:/g, " 00:");
      let end = formatDate(endDate, { timeZone: "local", month: "2-digit", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", meridiem: false, hour12: false }).replace(/\s24+:/g, " 00:");

      const payload = {
        startDate: start,
        endDate: end,
        locationId: formik.values.locationId,
      };
      const [err, res] = await tryCatch(getAlarmLogs(payload));
      if (err) {
        hideLoading();
        openToaster("bottom-right", { severity: "error", summary: err?.response?.data?.httpStatusCodeName, detail: err?.response?.data?.message, life: 3000 });
        return;
      }

      exportExcel(res.data, "Log");
      hideLoading();
      logFormik.resetForm();
      openToaster("bottom-right", { severity: "success", summary: res?.httpStatusCode, detail: "Log oluşturma başarılı.", life: 3000 });
    },
  });

  return (
    <>
      <div className="card">
        <div className="grid">
          <h3 className="w-full">Log Dosyası Oluştur</h3>
          <div className="col-12 md:col-4">
            <CustomCalendar showTime={true} showSeconds={true} className="w-full" errorMsg={getFormErrorMessage(logFormik, "startDate")} label="Başlangıç Tarihi" name="startDate" value={logFormik.values.startDate} onChange={logFormik.handleChange} />
          </div>
          <div className="col-12 md:col-4">
            <CustomCalendar showTime={true} showSeconds={true} className="w-full" errorMsg={getFormErrorMessage(logFormik, "endDate")} label="Bitiş Tarihi" name="endDate" value={logFormik.values.endDate} onChange={logFormik.handleChange} />
          </div>
          <div className="col-12 md:col-4">
            <Button type="button" className="p-button-primary w-full" label="Log Oluştur" onClick={() => logFormik.handleSubmit()} />
          </div>
        </div>
      </div>
      <div className="grid">
        <div className="col-12">
          <div className="card">
            <div className="grid">
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
              <div className="field col-12">
                <DataTable value={store?.iotProducts} showGridlines rows={50} responsiveLayout="scroll" emptyMessage="Veri bulunmamakta.">
                  <Column sortable field="imei" header="İmei" style={{ minWidth: "12rem" }} />
                  <Column sortable field="modelName" header="Model Adı" style={{ minWidth: "12rem" }} />
                  <Column
                    sortable
                    field="lastSignalDate"
                    header="Son Sinyal Tarihi"
                    style={{ minWidth: "12rem" }}
                    body={(rowdata) => formatDate(rowdata.lastSignalDate, { locale: "tr", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", meridiem: false })}
                  />
                  <Column sortable field="locationName" header="Mahal Id" style={{ minWidth: "12rem" }} />
                </DataTable>
              </div>
              <div className="field col-12">{renderFile(localationDetail?.fileUrl)}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
