/* eslint-disable array-callback-return */
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
import { getlocationAllItems } from "../../service/location";
import CustomDropdown from "../../components/Dropdown";
import ActionButtons from "../../components/ActionButtons";
import { Authority } from "../../utils/authority";
import { getDisplayIotModelSelectedItems } from "../../service/product-iot-model";
import { exportExcel } from "../../utils/exportExcel";
import { addScreenIot, getScreenIotDetail, getScreenIots, updateScreenIot } from "../../service/product-iot-screen";
import Textarea from "../../components/Textarea";
import { generateChild } from "../../utils/generateChild";

function AddModal({ opened, close, reload, modalType, id, locationSelectedItems, displayIotModelItems }) {
  const { setLoading, hideLoading, showLoading } = useContext(LoadingContext);
  const { openToaster } = useContext(ToasterContext);
  const [alllocations, allSetlocations] = useState(null);

  const formik = useFormik({
    initialValues: {
      imei: "",
      description: "",
      productIotModelId: "",
      locationIds: [],
      isActive: true,
    },
    validate: (values) => {
      const errors = {};

      if (!values.imei) {
        errors.imei = "L??tfen imei giriniz.";
      }

      if (!values.description) {
        errors.description = "L??tfen a????klama giriniz.";
      }

      if (!values.productIotModelId) {
        errors.productIotModelId = "L??tfen model se??iniz.";
      }

      if (values.locationIds.length === 0) {
        errors.locationIds = "L??tfen mahal se??iniz";
      }

      return errors;
    },
    onSubmit: async (data) => {
      showLoading();

      const payload = {
        ...data,
        locationIds: Object.keys(data.locationIds).map((item) => Number(item)),
      };

      if (modalType === Mode.EDIT) {
        const [err] = await tryCatch(updateScreenIot(payload));

        if (err) {
          hideLoading();
          openToaster("bottom-right", { severity: "error", summary: err?.response?.data?.externalResponseCodeName, detail: err?.response?.data?.message, life: 3000 });
          return;
        }
      } else {
        const [err] = await tryCatch(addScreenIot(payload));

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

  const [iotDisplayDetail] = useFetch(() => (id ? getScreenIotDetail(id) : {}), [], { setLoading, reloadDeps: [], deps: [] });

  useEffect(() => {
    if (modalType === Mode.EDIT) {
      let selectedLocations = {};

      iotDisplayDetail?.locations?.map((item) => {
        selectedLocations[item.key] = { checked: true, partialChecked: false };
      });

      formik.setValues({
        id: iotDisplayDetail.id,
        imei: iotDisplayDetail.imei,
        description: iotDisplayDetail.description,
        productIotModelId: iotDisplayDetail.productIotModelId,
        locationIds: selectedLocations,
        isActive: iotDisplayDetail.isActive,
      });
    } else {
      formik.setValues({
        imei: null,
        description: null,
        productIotModelId: null,
        locationIds: [],
        isActive: true  ,
      });
    }
  }, [iotDisplayDetail]);

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

  useEffect(() => {
    const locationItems = generateChild(locationSelectedItems);
    allSetlocations(locationItems);
  }, [locationSelectedItems]);

  return (
    <Dialog
      header={modalType !== Mode.EDIT ? "IOT Ekranl?? Cihaz Ekle" : "IOT Ekranl?? Cihaz D??zenle"}
      visible={opened}
      style={{ width: "50vw" }}
      footer={renderFooterModal()}
      onHide={() => {
        formik.resetForm();
        close();
      }}
    >
      <div className="pt-5 flex flex-column justify-content-center align-content-center" style={{ gap: "30px" }}>
        <Input className="w-full" errorMsg={getFormErrorMessage(formik, "imei")} label="??mei" name="imei" value={formik.values.imei} onChange={formik.handleChange} required={true} />
        <Textarea className="w-full" errorMsg={getFormErrorMessage(formik, "description")} label="A????klama" name="description" value={formik.values.description} onChange={formik.handleChange} required={true} />
        <CustomDropdown
          type="tree"
          selectionMode="checkbox"
          className="w-full"
          label="Mahal Se??iniz"
          errorMsg={getFormErrorMessage(formik, "locationIds")}
          options={alllocations}
          optionLabel="value"
          optionValue="key"
          name="locationIds"
          inputId="locationIds"
          value={formik.values.locationIds}
          onChange={formik.handleChange}
        />
        {alllocations && (
          <CustomDropdown
            className="w-full"
            label="??r??n Modeli Se??iniz"
            errorMsg={getFormErrorMessage(formik, "productIotModelId")}
            options={displayIotModelItems}
            optionLabel="value"
            optionValue="key"
            name="productIotModelId"
            inputId="productIotModelId"
            value={formik.values.productIotModelId}
            onChange={formik.handleChange}
          />
        )}

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

function IOTDisplayManagment() {
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

  const [displayIots, reloadDisplayIots] = useFetch(() => getScreenIots(payload), {}, { setLoading, reloadDeps: [payload], deps: [payload] });
  const [locationAllItems] = useFetch(() => getlocationAllItems(), [], { setLoading, reloadDeps: [], deps: [] });
  const [displayIotModelItems] = useFetch(() => getDisplayIotModelSelectedItems(), [], { reloadDeps: [], deps: [] });

  const items = [
    {
      label: "??mei",
      name: "imei",
      component: "input",
      type: "text",
    },
    {
      label: "??r??n Modeli",
      name: "productIotModelId",
      component: "dropdown",
      options: displayIotModelItems,
      optionLabel: "value",
      optionValue: "key",
    },
    {
      label: "Durumu",
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
    const [, res] = await tryCatch(getScreenIots({ pageSize: -1 }));

    exportExcel(res.results, "iotModel");
  };

  const renderHeader = () => <Button label="D????a Aktar" type="button" icon="pi pi-file-excel" onClick={() => handleExport()} className="p-button-success mr-2" data-pr-tooltip="XLS" />;

  return (
    <div className="grid">
      <div className="col-12">
        <SearchBar items={items} handleSearch={(data) => handleSearch(data)} />
        <div className="card">
          <h3>IOT Ekranl?? Cihaz Y??netimi</h3>
          <Divider />
          <ActionButtons>
            <Button code={Authority.IOTDisplayDeviceManagment_Insert} label="Ekle" onClick={() => openModalType("add")} />
          </ActionButtons>
          <Divider />
          <DataTable header={renderHeader} value={displayIots?.results} showGridlines rows={50} responsiveLayout="scroll" emptyMessage="Veri bulunmamakta.">
            <Column sortable field="imei" header="??mei" style={{ minWidth: "8rem" }} />
            <Column sortable field="description" header="A????klama" style={{ minWidth: "8rem" }} />
            <Column sortable field="modelName" header="Model" style={{ minWidth: "8rem" }} />
            <Column header="Durumu" style={{ minWidth: "8rem" }} body={(rowData) => (rowData.isActive ? "Aktif" : "Pasif")} />
            <Column
              header="Aksiyon"
              headerStyle={{ width: "4rem", textAlign: "center" }}
              bodyStyle={{ textAlign: "center", overflow: "visible" }}
              body={(rowData) => {
                return (
                  <ActionButtons>
                    <Button code={Authority.IOTDisplayDeviceManagment_Edit} type="button" label="D??zenle" onClick={() => openModalType(Mode.EDIT, rowData.id)} />
                  </ActionButtons>
                );
              }}
            />
          </DataTable>
          <Paginator first={first} rows={50} totalRecords={displayIots.rowCount} onPageChange={(e) => onPageChange(e)}></Paginator>
        </div>
      </div>
      {opened && <AddModal open={open} close={close} opened={opened} reload={reloadDisplayIots} modalType={modalType} id={currentId} locationSelectedItems={locationAllItems} displayIotModelItems={displayIotModelItems} />}
    </div>
  );
}

export default IOTDisplayManagment;
