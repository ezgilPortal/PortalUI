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
import { addLocation, getLocationDetail, getLocations, getlocationAllItems, updateLocation, uploadFile } from "../../service/location";
import CustomDropdown from "../../components/Dropdown";
import { getUserSelectedItems } from "../../service/user";
import { getFormErrorMessage } from "../../utils/formikErrorCheck";
import ActionButtons from "../../components/ActionButtons";
import { Authority } from "../../utils/authority";
import { FileUpload } from "primereact/fileupload";
import { exportExcel } from "../../utils/exportExcel";
import { generateChild } from "../../utils/generateChild";

function AddModal({ opened, close, reload, modalType, id }) {
  const { setLoading, hideLoading, showLoading } = useContext(LoadingContext);
  const { openToaster } = useContext(ToasterContext);

  const formik = useFormik({
    initialValues: {
      name: "",
      code: "",
      cubicMeter: "",
      squareMeter: "",
      locationType: "",
      isActive: true,
      locationFile: "",
      parentId: null,
    },
    validate: (values) => {
      const errors = {};

      if (!values.name) {
        errors.name = "Lütfen mahal adını giriniz.";
      }

      if (!values.code) {
        errors.code = "Lütfen kodu giriniz.";
      }

      if (!values.cubicMeter) {
        errors.cubicMeter = "Lütfen metreküp değerini giriniz.";
      }

      if (!values.squareMeter) {
        errors.squareMeter = "Lütfen metrekare değerini giriniz.";
      }

      if (values.locationType === "") {
        errors.locationType = "Lütfen mahal tipi seçiniz.";
      }

      return errors;
    },
    onSubmit: async (data) => {
      showLoading();
      let payload = data;

      if (formik.values.locationFile) {
        const locationFile = new FormData();
        locationFile.append("model", formik.values.locationFile);

        const [err, res] = await tryCatch(uploadFile(locationFile));

        if (err) {
          openToaster("bottom-right", { severity: "error", summary: err?.response?.data?.externalResponseCodeName, detail: err?.response?.data?.message, life: 3000 });
          return;
        }

        payload.fileUrl = res.fileUrl;
      }

      if (modalType === Mode.EDIT) {
        let editPayload = {};
        const { password, confirmPassword, ...rest } = payload;
        if (password === "" && confirmPassword === "") {
          editPayload = { ...rest };
        } else {
          editPayload = { ...rest, password, confirmPassword };
        }
        const [err] = await tryCatch(updateLocation(editPayload));

        if (err) {
          hideLoading();
          openToaster("bottom-right", { severity: "error", summary: err?.response?.data?.externalResponseCodeName, detail: err?.response?.data?.message, life: 3000 });
          return;
        }
      } else {
        const [err] = await tryCatch(addLocation(payload));

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

  const [localationDetail] = useFetch(() => (id ? getLocationDetail(id) : {}), [], { setLoading, reloadDeps: [], deps: [] });
  const [locationSelectedItems] = useFetch(() => getlocationAllItems(), [], { setLoading, reloadDeps: [], deps: [] });

  useEffect(() => {
    if (modalType === Mode.EDIT) {
      formik.setValues({
        id: localationDetail.id,
        name: localationDetail.name,
        code: localationDetail.code,
        cubicMeter: localationDetail.cubicMeter,
        squareMeter: localationDetail.squareMeter,
        locationType: Boolean(localationDetail.locationType),
        isActive: localationDetail.isActive,
        parentId: localationDetail.parentId,
      });
    } else {
      formik.setValues({
        name: "",
        code: "",
        cubicMeter: "",
        squareMeter: "",
        locationType: "",
        isActive: true,
        parentId: null,
      });
    }
  }, [localationDetail, locationSelectedItems]);

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

  const onChangeFile = (e, field) => {
    formik.setFieldValue(field, e.originalEvent.target.files[0]);
  };

  const renderFile = (fileUrl) => {
    let path = /.pdf$/;

    let isPdf = false;

    if (fileUrl) {
      if (path.test(fileUrl)) {
        isPdf = true;
      }
    }

    return (
      <div className="border-round-sm flex justify-content-center align-items-center" style={{ height: "100%" }}>
        {fileUrl && (isPdf ? <iframe title="pdf" src={fileUrl} className="w-full" style={{ minHeight: "1000px" }} /> : <img className="w-full" alt="" src={fileUrl}></img>)}
      </div>
    );
  };

  return (
    <Dialog
      header={modalType !== Mode.EDIT ? "Mahal Ekle" : "Mahal Düzenle"}
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
        <Input className="w-full" errorMsg={getFormErrorMessage(formik, "code")} label="Kod" name="code" value={formik.values.code} onChange={formik.handleChange} required={true} />
        <Input className="w-full" errorMsg={getFormErrorMessage(formik, "squareMeter")} label="MetreKare" name="squareMeter" value={formik.values.squareMeter} onChange={formik.handleChange} required={true} />
        <Input className="w-full" errorMsg={getFormErrorMessage(formik, "cubicMeter")} label="MetreKüp" name="cubicMeter" value={formik.values.cubicMeter} onChange={formik.handleChange} required={true} />
        <CustomDropdown
          className="w-full"
          label="Mahal Tipi Seçiniz"
          errorMsg={getFormErrorMessage(formik, "locationType")}
          options={[
            { label: "Açık Alan", value: false },
            { label: "Kapalı Alan", value: true },
          ]}
          optionLabel="label"
          optionValue="value"
          name="locationType"
          inputId="locationType"
          value={formik.values.locationType}
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

        <CustomDropdown className="w-full" label="Üst Mahal Seçiniz" type="tree" options={generateChild(locationSelectedItems)} optionLabel="value" optionValue="key" name="parentId" inputId="parentId" value={formik.values.parentId} onChange={formik.handleChange} disabled={modalType === Mode.DETAIL} />
        <FileUpload chooseOptions={{ className: "w-full" }} chooseLabel="Mahal görseli seçin" className="w-full" mode="basic" name="locationFile" accept="pdf/*" maxFileSize={10000000} onSelect={(e) => onChangeFile(e, "locationFile")} />
        {renderFile(localationDetail?.fileUrl)}
      </div>
    </Dialog>
  );
}

function LocationManagment() {
  const { setLoading } = useContext(LoadingContext);
  const [first, setFirst] = useState(0);
  const [locationId, setLocationId] = useState("");
  const [opened, open, close] = useDialogState();
  const [modalType, setModalType] = useState();
  const [payload, setPayload] = useState({
    page: 1,
    pageSize: 50,
    isActive: true
  });

  const [locations, reloadLocations] = useFetch(() => getLocations(payload), {}, { setLoading, reloadDeps: [payload], deps: [payload] });
  const [locationSelectedItems] = useFetch(() => getlocationAllItems(), [], { setLoading, reloadDeps: [], deps: [] });
  const [userListSelectedItems] = useFetch(() => getUserSelectedItems(), [], { setLoading, reloadDeps: [], deps: [] });

  const items = [
    {
      label: "Mahal",
      name: "locationId",
      component: "dropdown",
      options: generateChild(locationSelectedItems),
      optionLabel: "value",
      optionValue: "key",
      type: "tree",
    },

    {
      label: "Müşteri",
      name: "customerId",
      component: "dropdown",
      options: userListSelectedItems,
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
    {
      label: "Mahal Tipi",
      name: "locationType",
      component: "dropdown",
      options: [
        { label: "Kapalı Alan", value: true },
        { label: "Açık Alan", value: false },
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
    setLocationId(id);
    open();
  };

  const handleExport = async () => {
    const [, res] = await tryCatch(getLocations({ pageSize: -1 }));

    exportExcel(res.results, "location");
  };

  const renderHeader = () => <Button label="Dışa Aktar" type="button" icon="pi pi-file-excel" onClick={() => handleExport()} className="p-button-success mr-2" data-pr-tooltip="XLS" />;

  return (
    <div className="grid">
      <div className="col-12">
        <SearchBar items={items} handleSearch={(data) => handleSearch(data)} />
        <div className="card">
          <h3>Mahal Listesi</h3>
          <Divider />
          <ActionButtons>
            <Button code={Authority.LocationManagment_Insert} label="Ekle" onClick={() => openModalType("add")} />
          </ActionButtons>
          <Divider />
          <DataTable header={renderHeader} value={locations?.results} showGridlines rows={50} responsiveLayout="scroll" emptyMessage="Veri bulunmamakta.">
            <Column sortable field="code" header="Kod" style={{ minWidth: "8rem" }} />
            <Column sortable field="name" header="Mahal Adı" style={{ minWidth: "8rem" }} />
            <Column sortable field="squareMeter" header="MetreKare" style={{ minWidth: "8rem" }} />
            <Column sortable field="cubicMeter" header="MetreKüp" style={{ minWidth: "8rem" }} />
            <Column sortable header="Mahal Tipi" style={{ minWidth: "8rem" }} body={(rowData) => (rowData.locationType ? "Kapalı Alan" : "Açık Alan")} />
            <Column sortable field="parentLocationName" header="Üst Mahal" style={{ minWidth: "8rem" }} />
            <Column header="Durum" style={{ minWidth: "8rem" }} body={(rowData) => (rowData.isActive ? "Aktif" : "Pasif")} />
            <Column
              header="Aksiyon"
              headerStyle={{ width: "4rem", textAlign: "center" }}
              bodyStyle={{ textAlign: "center", overflow: "visible" }}
              body={(rowData) => {
                return (
                  <ActionButtons>
                    <Button code={Authority.LocationManagment_Edit} type="button" label="Düzenle" onClick={() => openModalType(Mode.EDIT, rowData.id)} />
                  </ActionButtons>
                );
              }}
            />
          </DataTable>
          <Paginator first={first} rows={50} totalRecords={locations.rowCount} onPageChange={(e) => onPageChange(e)}></Paginator>
        </div>
      </div>
      {opened && <AddModal open={open} close={close} opened={opened} reload={reloadLocations} modalType={modalType} id={locationId} />}
    </div>
  );
}

export default LocationManagment;
