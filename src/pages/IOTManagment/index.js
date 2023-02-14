/* eslint-disable array-callback-return */
/* eslint-disable no-extend-native */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import { tryCatch } from "@thalesrc/js-utils";
import { useFormik } from "formik";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { Checkbox } from "primereact/checkbox";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { Paginator } from "primereact/paginator";
import React, { useContext, useEffect, useState } from "react";
import Input from "../../components/Input";
import SearchBar from "../../components/SearchBar";
import { LoadingContext } from "../../context/Loading";
import { ToasterContext } from "../../context/ToasterContext";
import { useDialogState } from "../../hooks/use-dialog-state";
import { useFetch } from "../../hooks/use-fetch";
import { Mode } from "../../utils/mode";
import { addIot, getIotDetail, getIots, getIotSignalTypes, updateIot } from "../../service/product-iot";
import { getFormErrorMessage } from "../../utils/formikErrorCheck";
import CustomDropdown from "../../components/Dropdown";
import { getlocationAllItems } from "../../service/location";
import ActionButtons from "../../components/ActionButtons";
import { Authority } from "../../utils/authority";
import { getIotModelSelectedItems } from "../../service/product-iot-model";
import Textarea from "../../components/Textarea";
import classNames from "classnames";
import { Panel } from "primereact/panel";
import styled from "styled-components";
import { exportExcel } from "../../utils/exportExcel";
import { generateChild } from "../../utils/generateChild";

export const Container = styled.div`
  width: 100%;
  .p-panel-header {
    background-color: #0066b3;
    color: #fff;
  }

  .p-dropdown-trigger {
    display: none;
  }
`;

function AddModal({ opened, close, reload, modalType, id, locationSelectedItems, iotModelSelectedItems }) {
  const { setLoading, hideLoading, showLoading } = useContext(LoadingContext);
  const { openToaster } = useContext(ToasterContext);

  String.prototype.replaceAtIndex = function (index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
  };

  const formik = useFormik({
    initialValues: {
      imei: null,
      description: null,
      locationId: null,
      productIotModelId: null,
      productIotSignals: [],
      bitIndex: null,
      bitValue: 0,
      inputBitCount: null,
      outputBitCount: null,
      isActive: true
    },
    validate: (values) => {
      const errors = {};

      if (!values.imei) {
        errors.imei = "Lütfen imei giriniz.";
      }

      if (!values.locationId) {
        errors.locationId = "Lütfen mahal seçiniz.";
      }

      if (!values.productIotModelId) {
        errors.productIotModelId = "Lütfen ürün modeli seçiniz.";
      }

      // if (!values.productIotSignals) {
      //   errors.productIotSignals = "Lütfen ürün modeli seçiniz.";
      // }

      return errors;
    },
    onSubmit: async (data) => {
      showLoading();

      if (modalType === Mode.EDIT) {
        const [err] = await tryCatch(updateIot(data));

        if (err) {
          hideLoading();
          openToaster("bottom-right", { severity: "error", summary: err?.response?.data?.externalResponseCodeName, detail: err?.response?.data?.message, life: 3000 });
          return;
        }
      } else {
        const [err] = await tryCatch(addIot(data));

        if (err) {
          hideLoading();
          openToaster("bottom-right", { severity: "error", summary: err?.response?.data?.externalResponseCodeName, detail: err?.response?.data?.message, life: 3000 });
          return;
        }
      }

      hideLoading();
      formik.resetForm();
      reload();
      close();
    },
  });

  const [iotDetail] = useFetch(() => (id ? getIotDetail(id) : {}), [], { setLoading, reloadDeps: [], deps: [] });
  const [iotSignalTypes] = useFetch(() => getIotSignalTypes(), [], { reloadDeps: [], deps: [] });

  useEffect(() => {
    if (modalType === Mode.EDIT) {
      formik.setValues({
        id: iotDetail.id,
        imei: iotDetail.imei,
        description: iotDetail.description,
        locationId: iotDetail.locationId,
        productIotModelId: iotDetail.productIotModelId,
        productIotSignals: iotDetail.productIotSignals,
        inputBitCount: iotDetail.inputBitCount,
        outputBitCount: iotDetail.outputBitCount,
        isActive: iotDetail.isActive
      });
    } else {
      formik.setValues({
        imei: null,
        description: null,
        locationId: null,
        productIotModelId: null,
        productIotSignals: [],
        inputBitCount: null,
        outputBitCount: null,
        isActive: true
      });
    }
  }, [iotDetail, iotSignalTypes]);

  const handleChange = (signalIndex, e, index) => {
    let temp = formik.values.productIotSignals[signalIndex].bitStr.replaceAtIndex(index, e.value);
    formik.setFieldValue(`productIotSignals[${signalIndex}].bitStr`, temp);
    formik.setFieldValue(`productIotSignals[${signalIndex}].bitValue`, Number(e.value));
  };

  const handleCheckbox = (signalIndex, e) => {
    if (e.checked) {
      formik.setFieldValue(`productIotSignals[${signalIndex}].bitIndex`, e.target.value);
    } else {
      formik.setFieldValue(`productIotSignals[${signalIndex}].bitIndex`, "");
      formik.setFieldValue(`productIotSignals[${signalIndex}].bitStr`, "00000000000000000000000000000000");
    }
  };

  const handleIotModelChange = (e) => {
    const model = iotModelSelectedItems.find((item) => item.key === e.value);
    const { inputBitCount, outputBitCount } = model;

    formik.setFieldValue("productIotModelId", e.value);
    formik.setFieldValue("inputBitCount", inputBitCount);
    formik.setFieldValue("outputBitCount", outputBitCount);
    formik.setFieldValue(
      "productIotSignals",
      iotSignalTypes?.map((signal) => ({
        signalType: signal.value,
        signalTypeId: signal.key,
        bitStr: "00000000000000000000000000000000",
        bitIndex: "",
        bitValue: 0,
      }))
    );
  };
  const renderFooterModal = () => {
    return (
      <div>
        <Button
          label="Kapat"
          icon="pi pi-times"
          onClick={() => {
            formik.resetForm();
            close();
          }}
          className="p-button-text"
        />
        {modalType !== Mode.DETAIL && (
          <Button
            label="Kaydet"
            icon="pi pi-check"
            onClick={() => {
              formik.handleSubmit();
            }}
          />
        )}
      </div>
    );
  };

  return (
    <Dialog
      header={modalType !== Mode.EDIT ? "IOT Cihaz Ekle" : "IOT Cihaz Düzenle"}
      visible={opened}
      style={{ width: "85vw" }}
      footer={renderFooterModal()}
      onHide={() => {
        formik.resetForm();
        close();
      }}
    >
      <div className="pt-5 flex flex-column justify-content-center align-content-center" style={{ gap: "30px" }}>
        <Input className="w-full" errorMsg={getFormErrorMessage(formik, "imei")} label="Imei" name="imei" value={formik.values.imei} onChange={formik.handleChange} required={true} />
        <Textarea className="w-full" errorMsg={getFormErrorMessage(formik, "description")} label="Açıklama" name="description" value={formik.values.description} onChange={formik.handleChange} />
        <CustomDropdown type="tree" className="w-full" label="Mahal Seçiniz" errorMsg={getFormErrorMessage(formik, "locationId")} options={locationSelectedItems} optionLabel="value" optionValue="key" name="locationId" inputId="locationId" value={formik.values.locationId} onChange={formik.handleChange} />
        <CustomDropdown
          className="w-full"
          label="Durum"
          errorMsg={getFormErrorMessage(formik, "isActive")}
          options={[
            { label: "Aktif", value: true },
            { label: "Pasif", value: false },
          ]}
          optionLabel="label"
          optionValue="value"
          name="isActive"
          inputId="isActive"
          value={formik.values.isActive}
          onChange={formik.handleChange}
        />
        <CustomDropdown
          className="w-full"
          label="Ürün Modeli Seçiniz"
          errorMsg={getFormErrorMessage(formik, "productIotModelId")}
          options={iotModelSelectedItems}
          optionLabel="value"
          optionValue="key"
          name="productIotModelId"
          inputId="productIotModelId"
          value={formik.values.productIotModelId}
          onChange={handleIotModelChange}
        />
        <div className="card">
          <h4 className="p-error">Bilgilendirme</h4>
          <ul>
            <li>1 için NC (Normally Close)</li>
            <li>0 için N0 (Normally Open)</li>
          </ul>
        </div>
        <Container>
          {formik.values?.productIotSignals?.map((signal, index) => {
            return (
              <Panel header={`${signal.signalType} Kontak Seçimi`} key={index} className="mb-3 w-full overflow-scroll">
                <div key={"sgnl" + index} className="flex mt-5">
                  {new Array(16).fill(0).map((item, i) => {
                    if (i >= 16 - formik.values.inputBitCount) {
                      return (
                        <div className={classNames({ hidden: i < 16 - formik.values.inputBitCount }, "flex flex-column justify-content-center align-items-center")} key={i}>
                          <CustomDropdown
                            filter={false}
                            showClear={false}
                            disabled={signal.bitIndex !== i}
                            options={[
                              { label: "NO", value: "1" },
                              { label: "NC", value: "0" },
                            ]}
                            optionLabel="label"
                            optionValue="value"
                            label={`inp${16 - i}`}
                            minWidth="0"
                            key={signal.signalType + i}
                            value={signal.bitStr[i]}
                            containerStyle={{ width: "50px", marginRight: "5px" }}
                            onChange={(e) => handleChange(index, e, i)}
                            dropdownIcon=""
                          />
                          <Checkbox className="mt-2" disabled={i > 15} name="bitIndex" value={i} onChange={(e) => handleCheckbox(index, e)} checked={signal.bitIndex === i} />
                        </div>
                      );
                    }
                  })}
                </div>
              </Panel>
            );
          })}
        </Container>
      </div>
    </Dialog>
  );
}

function IOTManagment() {
  const { setLoading } = useContext(LoadingContext);
  const [first, setFirst] = useState(0);
  const [currentId, setId] = useState("");
  const [opened, open, close] = useDialogState();
  const [modalType, setModalType] = useState();
  const [payload, setPayload] = useState({
    page: 1,
    pageSize: 50,
    isActive: true
  });

  const [iots, reloadIots] = useFetch(() => getIots(payload), {}, { setLoading, reloadDeps: [payload], deps: [payload] });
  const [locationSelectedItems] = useFetch(() => getlocationAllItems(), [], { reloadDeps: [], deps: [] });
  const [iotModelSelectedItems] = useFetch(() => getIotModelSelectedItems(), [], { reloadDeps: [], deps: [] });

  const items = [
    {
      label: "İmei",
      name: "imei",
      component: "input",
      type: "text",
    },
    {
      label: "Mahal",
      name: "locationId",
      component: "dropdown",
      options: generateChild(locationSelectedItems),
      type: "tree",
      optionLabel: "value",
      optionValue: "key",
    },
    {
      label: "Ürün Modeli",
      name: "productIotModelId",
      component: "dropdown",
      options: iotModelSelectedItems,
      optionLabel: "value",
      optionValue: "key",
    },
    {
      label: "İnput Bit Sayısı",
      name: "inputBitCount",
      component: "input",
      type: "text",
    },
    {
      label: "Output Bit Sayısı",
      name: "outputBitCount",
      component: "input",
      type: "text",
    },
    {
      label: "Durum",
      name: "isActive",
      component: "dropdown",
      value: true,
      options: [
        { label: "Aktif", value: true },
        { label: "Pasif", value: false },
      ],
    },
  ];

  const handleSearch = (data) => {
    setPayload((prevState) => ({
      ...prevState,
      ...data,
    }));
  };

  const onPageChange = (event) => {
    setFirst(event.first);
    setPayload((prevState) => ({
      ...prevState,
      page: event.page + 1,
    }));
  };

  const openModalType = (type, id) => {
    setModalType(type);
    setId(id);
    open();
  };

  const handleExport = async () => {
    const [, res] = await tryCatch(getIots({ pageSize: -1 }));

    exportExcel(res.results, "iots");
  };

  const renderHeader = () => <Button label="Dışa Aktar" type="button" icon="pi pi-file-excel" onClick={() => handleExport()} className="p-button-success mr-2" data-pr-tooltip="XLS" />;

  return (
    <div className="grid">
      <div className="col-12">
        <SearchBar items={items} handleSearch={(data) => handleSearch(data)} />
        <div className="card">
          <h3>IOT Ürün Listesi</h3>
          <Divider />
          <ActionButtons>
            <Button code={Authority.IOTDeviceManagment_Insert} label="Ekle" onClick={() => openModalType("add")} />
          </ActionButtons>
          <Divider />
          <DataTable header={renderHeader} value={iots?.results} showGridlines rows={50} responsiveLayout="scroll" emptyMessage="Veri bulunmamakta.">
            <Column sortable field="imei" header="İmei" style={{ minWidth: "12rem" }} />
            <Column sortable field="description" header="Açıklama" style={{ minWidth: "12rem" }} />
            <Column sortable field="locationName" header="Mahal Id" style={{ minWidth: "12rem" }} />
            <Column sortable field="modelName" header="Model Adı" style={{ minWidth: "12rem" }} />
            <Column sortable field="inputBitCount" header="İnput Sayısı" style={{ minWidth: "8rem" }} />
            <Column sortable field="outputBitCount" header="Output Sayısı" style={{ minWidth: "8rem" }} />
            <Column sortable header="Ekran Var Mı ?" style={{ minWidth: "8rem" }} body={(rowData) => (rowData.hasScreen ? "Evet" : "Hayır")} />
            <Column header="Durum" style={{ minWidth: "12rem" }} body={(rowData) => (rowData.isActive ? "Aktif" : "Pasif")} />
            <Column
              header="Aksiyon"
              headerStyle={{ width: "4rem", textAlign: "center" }}
              bodyStyle={{ textAlign: "center", overflow: "visible" }}
              body={(rowData) => {
                return (
                  <ActionButtons>
                    <Button code={Authority.IOTDeviceManagment_Edit} type="button" label="Düzenle" onClick={() => openModalType(Mode.EDIT, rowData.id)} />
                  </ActionButtons>
                );
              }}
            />
          </DataTable>
          <Paginator first={first} rows={50} totalRecords={iots.rowCount} onPageChange={(e) => onPageChange(e)}></Paginator>
        </div>
      </div>
      {opened && <AddModal open={open} close={close} opened={opened} reload={reloadIots} modalType={modalType} id={currentId} locationSelectedItems={generateChild(locationSelectedItems)} iotModelSelectedItems={iotModelSelectedItems} />}
    </div>
  );
}

export default IOTManagment;
