/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import { tryCatch } from "@thalesrc/js-utils";
import { useFormik } from "formik";
import { Button } from "primereact/button";
import { Timeline } from "primereact/timeline";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import React, { useContext, useEffect, useState } from "react";
import Input from "../components/Input";
import SearchBar from "../components/SearchBar";
import { LoadingContext } from "../context/Loading";
import { ToasterContext } from "../context/ToasterContext";
import { useDialogState } from "../hooks/use-dialog-state";
import { useFetch } from "../hooks/use-fetch";
import { Mode } from "../utils/mode";
import { getFormErrorMessage } from "../utils/formikErrorCheck";
import { getlocationAllItems, getlocationByParentItem, getlocationParentSelectedItems } from "../service/location";
import { getProductNonIotSelectedItems } from "../service/product-non-iot";
import { Card } from "primereact/card";
import CustomCalendar from "../components/CustomCalendar";
import { getUserSelectedItems } from "../service/user";
import CustomDropdown from "../components/Dropdown";
import { addWorkSchedule, getWorkScheduleDetail, getWorkSchedules, updateWorkSchedule } from "../service/work-schedule";
import ActionButtons from "../components/ActionButtons";
import { Authority } from "../utils/authority";
import Textarea from "../components/Textarea";
import { Panel } from "primereact/panel";
import styled from "styled-components";
import { formatDate } from "@fullcalendar/core";
import { generateChild } from "../utils/generateChild";

export const Container = styled.div`
  width: 100%;
  .p-panel-header {
    background-color: #0066b3;
    color: #fff;
  }
`;

function AddModal({ opened, close, reload, modalType, id }) {
  const { setLoading, hideLoading, showLoading } = useContext(LoadingContext);
  const { openToaster } = useContext(ToasterContext);

  const formik = useFormik({
    initialValues: {
      id: "",
      plannedDate: "",
      description: "",
      estamatedUsedProduct: "",
      productNonIotId: "",
      userIdList: [],
      parentId: "",
      locationId: "",
    },
    validate: (values) => {
      const errors = {};
      if (!values.plannedDate) {
        errors.plannedDate = "Plan tarihi zorunludur.";
      }

      if (!values.description) {
        errors.description = "Açıklama zorunludur.";
      }

      if (!values.estamatedUsedProduct) {
        errors.estamatedUsedProduct = "Ürün adeti zorunludur.";
      }

      if (!values.productNonIotId) {
        errors.productNonIotId = "Cihaz seçimi zorunludur.";
      }

      if (values.userIdList.length === 0) {
        errors.userIdList = "Kullanıcı seçimi zorunludur.";
      }

      if (!values.locationId) {
        errors.locationId = "Mahal seçimi zorunludur.";
      }

      if (!values.parentId) {
        errors.parentId = "Bölge seçimi zorunludur.";
      }

      if (!values.plannedDate) {
        errors.plannedDate = "Plan tarihi zorunludur.";
      }

      return errors;
    },
    onSubmit: async (data) => {
      showLoading();

      const payload = { ...data, plannedDate: formatDate(data.plannedDate, { timeZone: "local" }) };

      if (modalType === Mode.EDIT) {
        const [err] = await tryCatch(updateWorkSchedule(payload));

        if (err) {
          hideLoading();
          openToaster("bottom-right", { severity: "error", summary: err?.response?.data?.externalResponseCodeName, detail: err?.response?.data?.message, life: 3000 });
          return;
        }
      } else {
        const [err] = await tryCatch(addWorkSchedule(payload));

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

  const [workScheduleDetail] = useFetch(() => (id ? getWorkScheduleDetail(id) : {}), [], { reloadDeps: [], deps: [] });
  const [userListSelectedItems] = useFetch(() => getUserSelectedItems(), [], { reloadDeps: [], deps: [] });
  const [locationParentSelectedItems] = useFetch(() => getlocationParentSelectedItems(), [], { reloadDeps: [], deps: [] });
  const [childrenlocationSelectedItems] = useFetch(() => (formik.values.parentId ? getlocationByParentItem(formik.values.parentId) : {}), [], { reloadDeps: [formik.values.parentId], deps: [formik.values.parentId] });
  const [nonProductIotSelectedItems] = useFetch(() => getProductNonIotSelectedItems(), [], { setLoading, reloadDeps: [], deps: [] });

  useEffect(() => {
    if (modalType === Mode.EDIT || modalType === Mode.DETAIL) {
      formik.setValues({
        id: workScheduleDetail.id,
        plannedDate: new Date(workScheduleDetail.plannedDate),
        description: workScheduleDetail.description,
        estamatedUsedProduct: workScheduleDetail.estamatedUsedProduct,
        productNonIotId: workScheduleDetail.productNonIotId,
        userIdList: workScheduleDetail.userList,
        locationId: workScheduleDetail.locationId,
        parentId: workScheduleDetail.regionId,
      });
    } else {
      formik.setValues({
        plannedDate: "",
        description: "",
        estamatedUsedProduct: "",
        productNonIotId: "",
        userIdList: [],
        locationId: "",
        parentId: "",
      });
    }
  }, [workScheduleDetail]);

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
      header={modalType !== Mode.EDIT ? "İş Takvimi Ekle" : "İş Takvimi Düzenle"}
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
          disabled={modalType === Mode.DETAIL}
        />
        <CustomDropdown
          disabled={modalType === Mode.DETAIL}
          className="w-full"
          label="Bölge Seçiniz"
          errorMsg={getFormErrorMessage(formik, "parentId")}
          options={locationParentSelectedItems}
          optionLabel="value"
          optionValue="key"
          name="parentId"
          inputId="parentId"
          value={formik.values.parentId}
          onChange={formik.handleChange}
        />

        <CustomDropdown
          disabled={modalType === Mode.DETAIL}
          className="w-full"
          label="Mahal Seçiniz"
          errorMsg={getFormErrorMessage(formik, "locationId")}
          options={childrenlocationSelectedItems.length > 0 ? childrenlocationSelectedItems : []}
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
          errorMsg={getFormErrorMessage(formik, "userIdList")}
          options={userListSelectedItems}
          optionLabel="value"
          optionValue="key"
          name="userIdList"
          inputId="userIdList"
          value={formik.values.userIdList}
          onChange={formik.handleChange}
        />
        <Textarea disabled={modalType === Mode.DETAIL} className="w-full" errorMsg={getFormErrorMessage(formik, "description")} label="Açıklama" name="description" value={formik.values.description} onChange={formik.handleChange} required={true} />
        <Input disabled={modalType === Mode.DETAIL} className="w-full" errorMsg={getFormErrorMessage(formik, "estamatedUsedProduct")} label="Ürün Adeti" name="estamatedUsedProduct" value={formik.values.estamatedUsedProduct} onChange={formik.handleChange} required={true} />
        <CustomCalendar disabled={modalType === Mode.DETAIL} className="w-full" errorMsg={getFormErrorMessage(formik, "plannedDate")} label="Plan Tarihi" name="plannedDate" value={formik.values.plannedDate} onChange={formik.handleChange} />
      </div>
    </Dialog>
  );
}

function WorkSchedule() {
  const { setLoading } = useContext(LoadingContext);
  const [currentId, setId] = useState("");
  const [opened, open, close] = useDialogState();
  const [modalType, setModalType] = useState();
  const [payload, setPayload] = useState({
    page: 1,
    pageSize: 50,
  });

  const [locationSelectedItems] = useFetch(() => getlocationAllItems(), [], { setLoading, reloadDeps: [], deps: [] });
  const [userListSelectedItems] = useFetch(() => getUserSelectedItems(), [], { setLoading, reloadDeps: [], deps: [] });
  const [workScheduleList, reloadWorkScheduleList] = useFetch(() => getWorkSchedules(payload), {}, { setLoading, reloadDeps: [payload], deps: [payload] });

  const handleSearch = (data) => {
    setPayload((prevState) => ({
      ...prevState,
      ...data,
    }));
  };

  const openModalType = (type, id) => {
    setModalType(type);
    setId(id);
    open();
  };

  const customizedMarker = (item) => {
    return (
      <span className="custom-marker shadow-1" style={{ backgroundColor: item.color }}>
        <i className={item.icon}></i>
      </span>
    );
  };

  const customizedContent = (item) => {
    return (
      <>
        <Card title={formatDate(new Date(item.plannedDate), { locale: "tr" })} className="mr-3" style={{ maxWidth: "250px" }}>
          <h6>Mahal:{item.locationName}</h6>
          <h6>Non Product:{item.productNonIotName}</h6>
          <p className="overflow-auto" style={{ height: "70px" }}>
            {item.description}
          </p>
          <ActionButtons>
            <Button code={Authority.WorkSchedule_Edit} label="Düzenle" onClick={() => openModalType(Mode.EDIT, item.id)} />
            <Button className="ml-2" code={Authority.WorkSchedule_Detail} label="Detay" onClick={() => openModalType(Mode.DETAIL, item.id)} />
          </ActionButtons>
        </Card>
      </>
    );
  };

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
      label: "Müşteri",
      name: "customerId",
      component: "dropdown",
      options: userListSelectedItems,
      optionLabel: "value",
      optionValue: "key",
    },
  ];

  return (
    <div className="grid">
      <div className="col-12">
        <SearchBar items={items} handleSearch={(data) => handleSearch(data)} />
        <div className="card">
          <h3>İş Takvimi</h3>
          <Divider />
          <ActionButtons>
            <Button code={Authority.WorkSchedule_Insert} label="Ekle" onClick={() => openModalType("add")} />
          </ActionButtons>
        </div>
        <Container>
          {workScheduleList?.results?.map(({ locationName, workSchedules }, index) => (
            <Panel header={locationName} key={index} className="mb-3 w-full overflow-scroll">
              <div className="grid align-items-center">
                <div className="col-12 overflow-scroll">
                  <Timeline value={workSchedules} layout="horizontal" align="top" className="customized-timeline" marker={customizedMarker} content={customizedContent} />
                </div>
              </div>
            </Panel>
          ))}
        </Container>
      </div>
      {opened && <AddModal open={open} close={close} opened={opened} reload={reloadWorkScheduleList} modalType={modalType} id={currentId} locationSelectedItems={locationSelectedItems} />}
    </div>
  );
}

export default WorkSchedule;
