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
import { addNonIot, getNonIots, updateNonIot, getNonIotDetail } from "../../service/product-non-iot";
import { getlocationAllItems, getProductNonIotTypeSelectedItems } from "../../service/location";
import CustomDropdown from "../../components/Dropdown";
import ActionButtons from "../../components/ActionButtons";
import { Authority } from "../../utils/authority";
import { exportExcel } from "../../utils/exportExcel";
import { generateChild } from "../../utils/generateChild";

function AddModal({ opened, close, reload, modalType, id, locationSelectedItems, productNonIotTypeSelectedItems }) {
  const { setLoading, hideLoading, showLoading } = useContext(LoadingContext);
  const { openToaster } = useContext(ToasterContext);

  const formik = useFormik({
    initialValues: {
      name: "",
      brand: "",
      serialNumber: "",
      productNonIOTTypeId: "",
      locationId: "",
      model: "",
      isActive: true,
      location: "",
      productNonIOTType: "",
    },
    validate: (values) => {
      const errors = {};

      if (!values.name) {
        errors.name = "Lütfen kullanıcı adını giriniz.";
      }

      if (!values.brand) {
        errors.brand = "Lütfen marka giriniz.";
      }

      if (!values.model) {
        errors.model = "Lütfen ürün kodu giriniz.";
      }

      if (!values.serialNumber) {
        errors.serialNumber = "Lütfen seri no giriniz.";
      }

      if (values.locationId === "") {
        errors.locationId = "Lütfen mahal seçiniz.";
      }

      if (values.productNonIOTTypeId === "") {
        errors.productNonIOTTypeId = "Lütfen ürün tipi seçiniz.";
      }

      return errors;
    },
    onSubmit: async (data) => {
      showLoading();

      if (modalType === Mode.EDIT) {
        const [err] = await tryCatch(updateNonIot(data));

        if (err) {
          hideLoading();
          openToaster("bottom-right", { severity: "error", summary: err?.response?.data?.externalResponseCodeName, detail: err?.response?.data?.message, life: 3000 });
          return;
        }
      } else {
        const [err] = await tryCatch(addNonIot(data));

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

  const [nonIotDetail] = useFetch(() => (id ? getNonIotDetail(id) : {}), [], { setLoading, reloadDeps: [], deps: [] });

  useEffect(() => {
    if (modalType === Mode.EDIT) {
      formik.setValues({
        id: nonIotDetail.id,
        name: nonIotDetail.name,
        brand: nonIotDetail.brand,
        model: nonIotDetail.model,
        serialNumber: nonIotDetail.serialNumber,
        locationId: nonIotDetail.locationId,
        productNonIOTTypeId: nonIotDetail.productNonIOTTypeId,
        isActive: nonIotDetail.isActive,
      });
    } else {
      formik.setValues({
        name: "",
        brand: "",
        model: "",
        serialNumber: "",
        locationId: "",
        productNonIOTTypeId: "",
        isActive: true,
      });
    }
  }, [nonIotDetail]);

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
      header={modalType !== Mode.EDIT ? "IOT Olmayan Cihaz  Ekle" : "IOT Olmayan Cihaz Düzenle"}
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
        <Input className="w-full" errorMsg={getFormErrorMessage(formik, "brand")} label="Marka" name="brand" value={formik.values.brand} onChange={formik.handleChange} required={true} />
        <Input className="w-full" errorMsg={getFormErrorMessage(formik, "model")} label="Ürün Kodu" name="model" value={formik.values.model} onChange={formik.handleChange} required={true} />
        <Input className="w-full" errorMsg={getFormErrorMessage(formik, "serialNumber")} label="Seri No" name="serialNumber" value={formik.values.serialNumber} onChange={formik.handleChange} required={true} />
        <CustomDropdown type="tree" className="w-full" label="Mahal Seçiniz" errorMsg={getFormErrorMessage(formik, "locationId")} options={locationSelectedItems} optionLabel="value" optionValue="key" name="locationId" inputId="locationId" value={formik.values.locationId} onChange={formik.handleChange} />
        <CustomDropdown
          className="w-full"
          label="Ürün Tipi Seçiniz"
          errorMsg={getFormErrorMessage(formik, "productNonIOTTypeId")}
          options={productNonIotTypeSelectedItems}
          optionLabel="value"
          optionValue="key"
          name="productNonIOTTypeId"
          inputId="productNonIOTTypeId"
          value={formik.values.productNonIOTTypeId}
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

function NonIOTManagment() {
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

  const [nonIots, reloadNonIots] = useFetch(() => getNonIots(payload), {}, { setLoading, reloadDeps: [payload], deps: [payload] });
  const [locationSelectedItems] = useFetch(() => getlocationAllItems(), [], { setLoading, reloadDeps: [], deps: [] });
  const [productNonIotTypeSelectedItems] = useFetch(() => getProductNonIotTypeSelectedItems(), [], { setLoading, reloadDeps: [], deps: [] });

  const items = [
    {
      label: "Mahal",
      name: "locationId",
      component: "dropdown",
      options: generateChild(locationSelectedItems),
      optionLabel: "value",
      optionValue: "key",
      type: "tree"
    },
    {
      label: "Ürün Tipi",
      name: "productNonIotTypeId",
      component: "dropdown",
      options: productNonIotTypeSelectedItems,
      optionLabel: "value",
      optionValue: "key",
    },
    {
      label: "Durum",
      name: "isActive",
      component: "dropdown",
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
    const [, res] = await tryCatch(getNonIots({ pageSize: -1 }));

    exportExcel(res.results, "nonIot");
  };

  const renderHeader = () => <Button label="Dışa Aktar" type="button" icon="pi pi-file-excel" onClick={() => handleExport()} className="p-button-success mr-2" data-pr-tooltip="XLS" />;

  return (
    <div className="grid">
      <div className="col-12">
        <SearchBar items={items} handleSearch={(data) => handleSearch(data)} />
        <div className="card">
          <h3>IOT Olmayan Ürün Listesi</h3>
          <Divider />
          <ActionButtons>
            <Button code={Authority.NonIOTDeviceManagment_Insert} label="Ekle" onClick={() => openModalType("add")} />
          </ActionButtons>
          <Divider />
          <DataTable header={renderHeader} value={nonIots?.results} showGridlines rows={50} responsiveLayout="scroll" emptyMessage="Veri bulunmamakta.">
            <Column sortable field="name" header="Ürün Adı" style={{ minWidth: "8rem" }} />
            <Column sortable field="brand" header="Marka" style={{ minWidth: "8rem" }} />
            <Column sortable field="model" header="Ürün Kodu" style={{ minWidth: "8rem" }} />
            <Column sortable field="serialNumber" header="Seri No" style={{ minWidth: "8rem" }} />
            <Column sortable header="Mahal" style={{ minWidth: "8rem" }} body={(rowData) => (rowData.location != null ? rowData.location.name : "")} />
            <Column sortable header="Ürün Tipi" style={{ minWidth: "8rem" }} body={(rowData) => (rowData.productNonIOTType != null ? rowData.productNonIOTType.description : "")} />
            <Column header="Durum" style={{ minWidth: "8rem" }} body={(rowData) => (rowData.isActive ? "Aktif" : "Pasif")} />
            <Column
              header="Aksiyon"
              headerStyle={{ width: "4rem", textAlign: "center" }}
              bodyStyle={{ textAlign: "center", overflow: "visible" }}
              body={(rowData) => {
                return (
                  <ActionButtons>
                    <Button code={Authority.NonIOTDeviceManagment_Edit} type="button" label="Düzenle" onClick={() => openModalType(Mode.EDIT, rowData.id)} />
                  </ActionButtons>
                );
              }}
            />
          </DataTable>
          <Paginator first={first} rows={50} totalRecords={nonIots.rowCount} onPageChange={(e) => onPageChange(e)}></Paginator>
        </div>
      </div>
      {opened && <AddModal open={open} close={close} opened={opened} reload={reloadNonIots} modalType={modalType} id={currentId} locationSelectedItems={generateChild(locationSelectedItems)} productNonIotTypeSelectedItems={productNonIotTypeSelectedItems} />}
    </div>
  );
}

export default NonIOTManagment;
