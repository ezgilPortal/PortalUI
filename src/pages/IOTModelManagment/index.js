/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import { tryCatch } from "@thalesrc/js-utils";
import { useFormik } from "formik";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
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
import { getFormErrorMessage } from "../../utils/formikErrorCheck";
import { getProductNonIotTypeSelectedItems } from "../../service/location";
import CustomDropdown from "../../components/Dropdown";
import ActionButtons from "../../components/ActionButtons";
import { Authority } from "../../utils/authority";
import { addIotModel, getIotModelDetail, getIotModels, updateIotModel } from "../../service/product-iot-model";
import { exportExcel } from "../../utils/exportExcel";

function AddModal({ opened, close, reload, modalType, id }) {
  const { setLoading, hideLoading, showLoading } = useContext(LoadingContext);
  const { openToaster } = useContext(ToasterContext);

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      inputBitCount: "",
      outputBitCount: "",
      hasScreen: "",
      heartBeatPeriod: '',
      isActive: true
    },
    validate: (values) => {
      const errors = {};

      if (!values.name) {
        errors.name = "Lütfen isim giriniz.";
      }

      if (!values.description) {
        errors.description = "Lütfen açıklama giriniz.";
      }

      if (!values.inputBitCount) {
        errors.inputBitCount = "Lütfen input sayısını giriniz.";
      }

      if (!values.outputBitCount) {
        errors.outputBitCount = "Lütfen output sayısını giriniz.";
      }

      if (!values.heartBeatPeriod) {
        errors.heartBeatPeriod = "Lütfen periyodik sinyal  süresi giriniz.";
      }

      if (values.hasScreen === "") {
        errors.hasScreen = "Lütfen ekran durumu seçiniz.";
      }

      return errors;
    },
    onSubmit: async (data) => {
      showLoading();

      if (modalType === Mode.EDIT) {
        const [err] = await tryCatch(updateIotModel(data));

        if (err) {
          hideLoading();
          openToaster("bottom-right", { severity: "error", summary: err?.response?.data?.externalResponseCodeName, detail: err?.response?.data?.message, life: 3000 });
          return;
        }
      } else {
        const [err] = await tryCatch(addIotModel(data));

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

  const [iotModelDetail] = useFetch(() => (id ? getIotModelDetail(id) : {}), [], { setLoading, reloadDeps: [], deps: [] });

  useEffect(() => {
    if (modalType === Mode.EDIT) {
      formik.setValues({
        id: iotModelDetail.id,
        name: iotModelDetail.name,
        description: iotModelDetail.description,
        inputBitCount: iotModelDetail.inputBitCount,
        outputBitCount: iotModelDetail.outputBitCount,
        hasScreen: iotModelDetail.hasScreen,
        heartBeatPeriod: iotModelDetail.heartBeatPeriod,
        isActive: iotModelDetail.isActive
      });
    } else {
      formik.setValues({
        name: "",
        description: "",
        inputBitCount: "",
        outputBitCount: "",
        hasScreen: "",
        heartBeatPeriod: '',
        isActive: true
      });
    }
  }, [iotModelDetail]);

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
      header={modalType !== Mode.EDIT ? "IOT Cihaz Model Ekle" : "IOT Cihaz Model Düzenle"}
      visible={opened}
      style={{ width: "50vw" }}
      footer={renderFooterModal()}
      onHide={() => {
        formik.resetForm();
        close();
      }}
    >
      <div className="pt-5 flex flex-column justify-content-center align-content-center" style={{ gap: "30px" }}>
        <Input className="w-full" errorMsg={getFormErrorMessage(formik, "name")} label="Ad" name="name" value={formik.values.name} onChange={formik.handleChange} required={true} />
        <Input className="w-full" errorMsg={getFormErrorMessage(formik, "description")} label="Açıklama" name="description" value={formik.values.description} onChange={formik.handleChange} required={true} />
        <Input className="w-full" errorMsg={getFormErrorMessage(formik, "inputBitCount")} label="İnput Sayısı" name="inputBitCount" value={formik.values.inputBitCount} onChange={formik.handleChange} required={true} keyfilter="int" />
        <Input className="w-full" errorMsg={getFormErrorMessage(formik, "outputBitCount")} label="Output Sayısı" name="outputBitCount" value={formik.values.outputBitCount} onChange={formik.handleChange} required={true} keyfilter="int" />
        <Input className="w-full" errorMsg={getFormErrorMessage(formik, "heartBeatPeriod")} label="Periyodik Sinyal Süresi" name="heartBeatPeriod" value={formik.values.heartBeatPeriod} onChange={formik.handleChange} required={true} keyfilter="int" placeholder="Bottom" tooltip="Periyodik Sinyal Süresini Saniye Cinsinden Giriniz." tooltipOptions={{position: 'bottom'}} />
        <CustomDropdown
          className="w-full"
          label="Ekran Var Mı ?"
          errorMsg={getFormErrorMessage(formik, "hasScreen")}
          options={[
            { label: "Evet", value: true },
            { label: "Hayır", value: false },
          ]}
          optionLabel="label"
          optionValue="value"
          name="hasScreen"
          inputId="hasScreen"
          value={formik.values.hasScreen}
          onChange={formik.handleChange}
        />
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
      </div>
    </Dialog>
  );
}

function IOTModelManagment() {
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

  const [nonIots, reloadNonIots] = useFetch(() => getIotModels(payload), {}, { setLoading, reloadDeps: [payload], deps: [payload] });
  const [productNonIotTypeSelectedItems] = useFetch(() => getProductNonIotTypeSelectedItems(), [], { setLoading, reloadDeps: [], deps: [] });

  const items = [
    {
      label: "Cihaz Adı",
      name: "name",
      component: "input",
      type: "text",
    },
    {
      label: "İnput Sayısı",
      name: "inputBitCount",
      component: "input",
      type: "text",
    },
    {
      label: "Output Sayısı",
      name: "outputBitCount",
      component: "input",
      type: "text",
    },
    {
      label: "Ekran Durumu",
      name: "hasScreen",
      component: "dropdown",
      options: [
        { label: "Evet", value: true },
        { label: "Hayır", value: false },
      ],
      optionLabel: "label",
      optionValue: "value",
    },
    {
      label: "Durum",
      name: "isActive",
      component: "dropdown",
      options: [
        { label: "Aktif", value: true },
        { label: "Pasif", value: false },
      ],
      optionLabel: "label",
      optionValue: "value",
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
    const [, res] = await tryCatch(getIotModels({ pageSize: -1 }));

    exportExcel(res.results, "iotModel");
  };

  const renderHeader = () => <Button label="Dışa Aktar" type="button" icon="pi pi-file-excel" onClick={() => handleExport()} className="p-button-success mr-2" data-pr-tooltip="XLS" />;

  return (
    <div className="grid">
      <div className="col-12">
        <SearchBar items={items} handleSearch={(data) => handleSearch(data)} />
        <div className="card">
          <h3>IOT Cihaz Model Yönetimi</h3>
          <Divider />
          <ActionButtons>
            <Button code={Authority.IOTDeviceModelManagment_Insert} label="Ekle" onClick={() => openModalType("add")} />
          </ActionButtons>
          <Divider />
          <DataTable header={renderHeader} value={nonIots?.results} showGridlines rows={50} responsiveLayout="scroll" emptyMessage="Veri bulunmamakta.">
            <Column sortable field="name" header="Ürün Adı" style={{ minWidth: "8rem" }} />
            <Column sortable field="description" header="Açıklama" style={{ minWidth: "8rem" }} />
            <Column sortable field="inputBitCount" header="İnput Sayısı" style={{ minWidth: "8rem" }} />
            <Column sortable field="outputBitCount" header="Output Sayısı" style={{ minWidth: "8rem" }} />
            <Column sortable field="hasScreen" header="Ekran Var Mı ?" style={{ minWidth: "8rem" }} body={(rowData) => (rowData.hasScreen ? "Evet" : "Hayır")} />
            <Column header="Durum" style={{ minWidth: "8rem" }} body={(rowData) => (rowData.isActive ? "Aktif" : "Pasif")} />
            <Column
              header="Aksiyon"
              headerStyle={{ width: "4rem", textAlign: "center" }}
              bodyStyle={{ textAlign: "center", overflow: "visible" }}
              body={(rowData) => {
                return (
                  <ActionButtons>
                    <Button code={Authority.IOTDeviceModelManagment_Edit} type="button" label="Düzenle" onClick={() => openModalType(Mode.EDIT, rowData.id)} />
                  </ActionButtons>
                );
              }}
            />
          </DataTable>
          <Paginator first={first} rows={50} totalRecords={nonIots.rowCount} onPageChange={(e) => onPageChange(e)}></Paginator>
        </div>
      </div>
      {opened && <AddModal open={open} close={close} opened={opened} reload={reloadNonIots} modalType={modalType} id={currentId} productNonIotTypeSelectedItems={productNonIotTypeSelectedItems} />}
    </div>
  );
}

export default IOTModelManagment;
