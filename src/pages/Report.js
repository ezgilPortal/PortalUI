/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import { tryCatch } from "@thalesrc/js-utils";
import { useFormik } from "formik";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Paginator } from "primereact/paginator";
import React, { useContext, useEffect, useState } from "react";
import Input from "../components/Input";
import SearchBar from "../components/SearchBar";
import { LoadingContext } from "../context/Loading";
import { ToasterContext } from "../context/ToasterContext";
import { useDialogState } from "../hooks/use-dialog-state";
import { useFetch } from "../hooks/use-fetch";
import { Mode } from "../utils/mode";
import { getFormErrorMessage } from "../utils/formikErrorCheck";
import { getlocationAllItems } from "../service/location";
import { addServiceForm, getServiceFormDetail, getServiceForms, updateServiceForm } from "../service/service-form";
import CustomCalendar from "../components/CustomCalendar";
import { getUserSelectedItems } from "../service/user";
import CustomDropdown from "../components/Dropdown";
import { getServiceProcessSelectedItems } from "../service/service-process";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { getProductNonIotSelectedItems } from "../service/product-non-iot";
import ActionButtons from "../components/ActionButtons";
import { Authority } from "../utils/authority";
import Textarea from "../components/Textarea";
import { formatDate } from "@fullcalendar/core";
import { generateChild } from "../utils/generateChild";

function AddModal({ opened, close, reload, modalType, id , locationSelectedItems}) {
  const { setLoading, hideLoading, showLoading } = useContext(LoadingContext);
  const { openToaster } = useContext(ToasterContext);

  const formik = useFormik({
    initialValues: {
      formNumber: "",
      formDate: "",
      dispatchNo: "",
      serviceStartDateTime: "",
      serviceEndDateTime: "",
      serviceDescription: "",
      serviceReportNo: "",
      serviceProcessId: "",
      productNonIotId: "",
      userList: "",
      user: "",
      locationId: "",
      location: "",
      serviceProcces: "",
      serialNumber: "",
    },
    validate: (values) => {
      const errors = {};
      if (!values.formNumber) {
        errors.formNumber = "Bu alan zorunludur.";
      }
      if (!values.dispatchNo) {
        errors.dispatchNo = "Bu alan zorunludur.";
      }
      if (!values.serviceStartDateTime) {
        errors.serviceStartDateTime = "Bu alan zorunludur.";
      }
      if (!values.serviceEndDateTime) {
        errors.serviceEndDateTime = "Bu alan zorunludur.";
      }
      if (!values.serviceDescription) {
        errors.serviceDescription = "Bu alan zorunludur.";
      }
      if (!values.serviceReportNo) {
        errors.serviceReportNo = "Bu alan zorunludur.";
      }
      if (!values.serviceProcessId) {
        errors.serviceProcessId = "Bu alan zorunludur.";
      }
      if (!values.productNonIotId) {
        errors.productNonIotId = "Bu alan zorunludur.";
      }
      if (values.userList.length === 0) {
        errors.userList = "Bu alan zorunludur.";
      }
      if (!values.locationId) {
        errors.locationId = "Bu alan zorunludur.";
      }
      if (!values.serialNumber) {
        errors.serialNumber = "Bu alan zorunludur.";
      }

      return errors;
    },
    onSubmit: async (data) => {
      showLoading();

      const payload = { ...data, serviceStartDateTime: formatDate(data.serviceStartDateTime, { timeZone: "local" }), serviceEndDateTime: formatDate(data.serviceEndDateTime, { timeZone: "local" }) };

      if (modalType === Mode.EDIT) {
        const [err] = await tryCatch(updateServiceForm(payload));

        if (err) {
          hideLoading();
          openToaster("bottom-right", { severity: "error", summary: err?.response?.data?.externalResponseCodeName, detail: err?.response?.data?.message, life: 3000 });
          return;
        }
      } else {
        const [err] = await tryCatch(addServiceForm(payload));

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

  const [serviceFormDetail] = useFetch(() => (id ? getServiceFormDetail(id) : {}), [], { setLoading, reloadDeps: [], deps: [] });
  const [nonProductIotSelectedItems] = useFetch(() => getProductNonIotSelectedItems(), [], { setLoading, reloadDeps: [], deps: [] });
  const [processSelectedItems] = useFetch(() => getServiceProcessSelectedItems(), [], { setLoading, reloadDeps: [], deps: [] });
  const [userListSelectedItems] = useFetch(() => getUserSelectedItems(), [], { setLoading, reloadDeps: [], deps: [] });

  useEffect(() => {
    if (modalType === Mode.EDIT || modalType === Mode.DETAIL) {
      formik.setValues({
        id: serviceFormDetail.id,
        formNumber: serviceFormDetail.formNumber,
        dispatchNo: serviceFormDetail.dispatchNo,
        serialNumber: serviceFormDetail.serialNumber,
        serviceStartDateTime: serviceFormDetail.serviceStartDateTime ? new Date(serviceFormDetail.serviceStartDateTime) : "",
        serviceEndDateTime: serviceFormDetail.serviceEndDateTime ? new Date(serviceFormDetail.serviceEndDateTime) : "",
        serviceDescription: serviceFormDetail.serviceDescription,
        serviceReportNo: serviceFormDetail.serviceReportNo,
        serviceProcessId: serviceFormDetail.serviceProcessId,
        productNonIotId: serviceFormDetail?.serviceFormProductNonIots?.map((item) => item.productNonIotId),
        userList: serviceFormDetail.userList,
        locationId: serviceFormDetail.locationId,
      });
    } else {
      formik.setValues({
        formNumber: "",
        dispatchNo: "",
        serviceStartDateTime: "",
        serviceEndDateTime: "",
        serviceDescription: "",
        serviceReportNo: "",
        serviceProcessId: "",
        productNonIotId: "",
        userList: "",
        locationId: "",
        serialNumber: "",
      });
    }
  }, [serviceFormDetail]);

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
      header={modalType === Mode.CREATE ? "Rapor Ekle" : "Rapor Düzenle"}
      visible={opened}
      style={{ width: "50vw" }}
      footer={renderFooterModal()}
      onHide={() => {
        formik.resetForm();
        close();
      }}
    >
      <div className="pt-5 flex flex-column justify-content-center align-content-center" style={{ gap: "30px" }}>
        <CustomDropdown
          disabled={modalType === Mode.DETAIL}
          className="w-full"
          label="NonIOT Cihaz Seçiniz"
          errorMsg={getFormErrorMessage(formik, "productNonIotId")}
          options={nonProductIotSelectedItems}
          optionLabel="value"
          optionValue="key"
          name="productNonIotId"
          inputId="productNonIotId"
          value={formik.values.productNonIotId}
          onChange={formik.handleChange}
          type="multi"
        />
        <CustomDropdown
          disabled={modalType === Mode.DETAIL}
          className="w-full"
          label="Mahal Seçiniz"
          errorMsg={getFormErrorMessage(formik, "locationId")}
          options={locationSelectedItems}
          type="tree"
          optionLabel="value"
          optionValue="key"
          name="locationId"
          inputId="locationId"
          value={formik.values.locationId}
          onChange={formik.handleChange}
        />
        <CustomDropdown
          type="multi"
          disabled={modalType === Mode.DETAIL}
          className="w-full"
          label="Saha Personeli Seçiniz"
          errorMsg={getFormErrorMessage(formik, "userList")}
          options={userListSelectedItems}
          optionLabel="value"
          optionValue="key"
          name="userList"
          inputId="userList"
          value={formik.values.userList}
          onChange={formik.handleChange}
        />
        <CustomDropdown
          disabled={modalType === Mode.DETAIL}
          className="w-full"
          label="Durum Seçiniz"
          errorMsg={getFormErrorMessage(formik, "serviceProcessId")}
          options={processSelectedItems}
          optionLabel="value"
          optionValue="key"
          name="serviceProcessId"
          inputId="serviceProcessId"
          value={formik.values.serviceProcessId}
          onChange={formik.handleChange}
        />
        <Input disabled={modalType === Mode.DETAIL} className="w-full" errorMsg={getFormErrorMessage(formik, "dispatchNo")} label="Sevk Numarası" name="dispatchNo" value={formik.values.dispatchNo} onChange={formik.handleChange} required={true} />
        <Input disabled={modalType === Mode.DETAIL} className="w-full" errorMsg={getFormErrorMessage(formik, "formNumber")} label="Form Numarası" name="formNumber" value={formik.values.formNumber} onChange={formik.handleChange} required={true} />
        <Input disabled={modalType === Mode.DETAIL} className="w-full" errorMsg={getFormErrorMessage(formik, "serviceReportNo")} label="Servis Rapor Numarası" name="serviceReportNo" value={formik.values.serviceReportNo} onChange={formik.handleChange} required={true} />
        <Textarea disabled={modalType === Mode.DETAIL} className="w-full" errorMsg={getFormErrorMessage(formik, "serviceDescription")} label="Servis Açıklaması" name="serviceDescription" value={formik.values.serviceDescription} onChange={formik.handleChange} required={true} />
        <Input disabled={modalType === Mode.DETAIL} className="w-full" errorMsg={getFormErrorMessage(formik, "serialNumber")} label="Seri No" name="serialNumber" value={formik.values.serialNumber} onChange={formik.handleChange} required={true} />
        <CustomCalendar disabled={modalType === Mode.DETAIL} className="w-full" errorMsg={getFormErrorMessage(formik, "serviceStartDateTime")} label="Başlangıç Tarihi" name="serviceStartDateTime" value={formik.values.serviceStartDateTime} onChange={formik.handleChange} />
        <CustomCalendar disabled={modalType === Mode.DETAIL} className="w-full" errorMsg={getFormErrorMessage(formik, "serviceEndDateTime")} label="Bitiş Tarihi" name="serviceEndDateTime" value={formik.values.serviceEndDateTime} onChange={formik.handleChange} />
      </div>
    </Dialog>
  );
}

function Report() {
  const { setLoading } = useContext(LoadingContext);
  const [first, setFirst] = useState(0);
  const [currentId, setId] = useState("");
  const [opened, open, close] = useDialogState();
  const [modalType, setModalType] = useState();
  const [payload, setPayload] = useState({
    page: 1,
    pageSize: 50,
  });

  const [locationSelectedItems] = useFetch(() => getlocationAllItems(), [], { setLoading, reloadDeps: [], deps: [] });
  const [serviceFormList, reloadserviceFormList] = useFetch(() => getServiceForms(payload), {}, { setLoading, reloadDeps: [payload], deps: [payload] });
  const [processSelectedItems] = useFetch(() => getServiceProcessSelectedItems(), [], { setLoading, reloadDeps: [], deps: [] });
  const [userListSelectedItems] = useFetch(() => getUserSelectedItems(), [], { setLoading, reloadDeps: [], deps: [] });

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

  const renderHeader = () => (
    <div className="flex align-items-center export-buttons">
      <ActionButtons>
        <Button code={Authority.ServiceLog_Export} label="Dışa Aktar" type="button" icon="pi pi-file-excel" onClick={() => exportExcel()} className="p-button-success mr-2" data-pr-tooltip="XLS" />
        <Button code={Authority.ServiceLog_Insert} type="button" label="Ekle" onClick={() => openModalType(Mode.CREATE)} />
      </ActionButtons>
    </div>
  );

  const exportExcel = async () => {
    const [, res] = await tryCatch(getServiceForms({ pageSize: -1 }));
    await import("xlsx").then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(
        res?.results?.map((item) => {
          return {
            Oluşturan: item.createdBy,
            "Form Numarası": item.formNumber,
            "Servis Numarası": item.serviceReportNo,
            "Servis Başlama Tarihi": item.serviceStartDateTime,
            "Servis Bitiş Tarihi": item.serviceEndDateTime,
            "Servis Açıklaması": item.serviceDescription,
            "Sevk Numarası": item.dispatchNo,
            Müşteri: item?.user?.name,
            Mahal: item.location.name,
            Süreç: item.serviceProcces.description,
          };
        })
      );
      const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
      const excelBuffer = xlsx.write(workbook, { bookType: "xlsx", type: "array" });
      saveAsExcelFile(excelBuffer, "report");
    });
  };

  const saveAsExcelFile = (buffer, fileName) => {
    import("file-saver").then((module) => {
      if (module && module.default) {
        let EXCEL_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        let EXCEL_EXTENSION = ".xlsx";
        const dataFile = new Blob([buffer], {
          type: EXCEL_TYPE,
        });

        module.default.saveAs(dataFile, fileName + "_export_" + new Date().getTime() + EXCEL_EXTENSION);
      }
    });
  };

  const items = [
    {
      label: "Form Numarası",
      name: "formNumber",
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
      label: "Müşteri",
      name: "customerId",
      component: "dropdown",
      options: userListSelectedItems,
      optionLabel: "value",
      optionValue: "key",
    },
    {
      label: "Servis Statü",
      name: "serviceProcessId",
      component: "dropdown",
      options: processSelectedItems,
      optionLabel: "value",
      optionValue: "key",
    },
  ];

  const header = renderHeader();

  return (
    <div className="grid">
      <div className="col-12">
        <SearchBar items={items} handleSearch={(data) => handleSearch(data)} />
        <div className="card">
          <DataTable value={serviceFormList?.results} className="p-datatable-customers" header={header} rows={50} dataKey="id" rowHover filterDisplay="menu" responsiveLayout="scroll" emptyMessage="Veri Bulunamadı">
            <Column sortable field="formNumber" header="Form Numarası" style={{ minWidth: "8rem" }} />
            <Column sortable field="serviceReportNo" header="Servis Numarası" style={{ minWidth: "8rem" }} />
            <Column sortable dataType="date" field="serviceStartDateTime" header="Servis Başlama Tarihi" style={{ minWidth: "13rem" }} body={(rowData) => formatDate(rowData.serviceStartDateTime, { locale: "tr" })} />
            <Column sortable dataType="date" field="serviceEndDateTime" header="Servis Bitiş Tarihi" style={{ minWidth: "13rem" }} body={(rowData) => formatDate(rowData.serviceEndDateTime, { locale: "tr" })} />
            <Column sortable field="serviceDescription" header="Servis Açıklaması" style={{ minWidth: "8rem" }} />
            <Column sortable field="dispatchNo" header="Sevk Numarası" style={{ minWidth: "8rem" }} />
            <Column field="user.name" header="Müşteri" sortable filterField="user.name" style={{ minWidth: "8rem" }} />
            <Column field="location.name" header="Mahal" sortable filterField="location.name" style={{ minWidth: "8rem" }} />
            <Column field="serviceProcces.description" header="Servis Statü" sortable filterField="serviceProcces.description" style={{ minWidth: "8rem" }} />
            <Column
              header="Aksiyon"
              headerStyle={{ width: "4rem", textAlign: "center" }}
              bodyStyle={{ textAlign: "center", overflow: "visible" }}
              body={(rowData) => {
                return (
                  <ActionButtons>
                    <Button code={Authority.ServiceLog_Edit} type="button" label="Düzenle" onClick={() => openModalType(Mode.EDIT, rowData.id)} />
                    <Button code={Authority.ServiceLog_Detail} type="button" label="Detay" onClick={() => openModalType(Mode.DETAIL, rowData.id)} />
                  </ActionButtons>
                );
              }}
            />
          </DataTable>
          <Paginator first={first} rows={50} totalRecords={serviceFormList.rowCount} onPageChange={(e) => onPageChange(e)}></Paginator>
        </div>
      </div>
      {opened && <AddModal open={open} close={close} opened={opened} reload={reloadserviceFormList} modalType={modalType} id={currentId}  locationSelectedItems = {generateChild(locationSelectedItems)} />}
    </div>
  );
}

export default Report;
