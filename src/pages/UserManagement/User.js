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
import CustomDropdown from "../../components/Dropdown";
import Input from "../../components/Input";
import SearchBar from "../../components/SearchBar";
import { LoadingContext } from "../../context/Loading";
import { ToasterContext } from "../../context/ToasterContext";
import { useDialogState } from "../../hooks/use-dialog-state";
import { useFetch } from "../../hooks/use-fetch";
import { addUser, getAllUser, getRoleSelectedItems, getUserDetail, getUserSelectedItems, updateUser } from "../../service/user";
import { Mode } from "../../utils/mode";
import { Authority } from "../../utils/authority";
import { getlocationAllItems } from "../../service/location";
import { validEmailRegex } from "../../utils/regex";
import ActionButtons from "../../components/ActionButtons";
import { exportExcel } from "../../utils/exportExcel";
import { getFormErrorMessage } from "../../utils/formikErrorCheck";
import { generateChild } from "../../utils/generateChild";
import { Checkbox } from "primereact";

function AddModal({ opened, close, reloadUsers, modalType, id, roleSelectedItems, userSelectedItems }) {
  const { setLoading, hideLoading, showLoading } = useContext(LoadingContext);
  const { openToaster } = useContext(ToasterContext);
  const [alllocations, allSetlocations] = useState(null);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      mobilePhone: "",
      password: "",
      confirmPassword: "",
      parentId: null,
      roleId: "",
      locationIds: [],
      isActive: true,
      isSendSms: false,
      isSendMail: false,
    },
    validate: (values) => {
      const errors = {};
      if (!values.name) {
        errors.name = "Lütfen kullanıcı adını giriniz.";
      }

      if (!values.email) {
        errors.email = "Lütfen e-posta adresini giriniz.";
      }

      if (values.mobilePhone === "") {
        errors.mobilePhone = "Lütfen telefon numarasını giriniz.";
      }

      if (values.mobilePhone.length !== 10) {
        errors.mobilePhone = "Lütfen telefon numarasını 10 haneli olarak giriniz.";
      }

      if (values.email && !values.email.match(validEmailRegex)) {
        errors.email = "Lütfen geçerli bir email adresi giriniz.";
      }

      if (values.password !== values.confirmPassword) {
        errors.password = "Şifreler uyuşmuyor.";
        errors.confirmPassword = "Şifreler uyuşmuyor.";
      }

      if (!values.roleId) {
        errors.roleId = "Lütfen bir rol seçiniz.";
      }

      if (values.locationIds.length === 0) {
        errors.locationIds = "Lütfen en az bir mahal seçiniz.";
      }

      return errors;
    },
    onSubmit: async (data) => {
      showLoading();

      const formData = {
        ...data,
        locationIds: Object.keys(data.locationIds).map((item) => Number(item)),
      };

      if (modalType === Mode.EDIT) {
        let payload = {};
        const { password, confirmPassword, ...rest } = formData;
        if (password === "" && confirmPassword === "") {
          payload = { ...rest };
        } else {
          payload = { ...rest, password, confirmPassword };
        }
        const [err] = await tryCatch(updateUser(payload));

        if (err) {
          hideLoading();
          openToaster("bottom-right", { severity: "error", summary: err?.response?.data?.externalResponseCodeName, detail: err?.response?.data?.message, life: 3000 });
          return;
        }
      } else {
        const [err] = await tryCatch(addUser(formData));

        if (err) {
          hideLoading();
          openToaster("bottom-right", { severity: "error", summary: err?.response?.data?.externalResponseCodeName, detail: err?.response?.data?.message, life: 3000 });
          return;
        }
      }

      hideLoading();
      formik.resetForm();
      reloadUsers();
      close();
    },
  });

  const [userDetail] = useFetch(() => (id ? getUserDetail(id) : {}), [], { setLoading, reloadDeps: [], deps: [] });
  const [locationSelectedItems] = useFetch(() => getlocationAllItems(), [], { setLoading, reloadDeps: [], deps: [] });

  useEffect(() => {
    const locationItems = generateChild(locationSelectedItems);
    allSetlocations(locationItems);
  }, [locationSelectedItems]);

  useEffect(() => {
    if (modalType === Mode.EDIT) {
      let selectedLocations = {};

      userDetail?.locations?.map((item) => {
        selectedLocations[item.key] = { checked: true, partialChecked: false };
      });

      formik.setValues({
        id: userDetail.id,
        name: userDetail.name,
        email: userDetail.email,
        mobilePhone: userDetail.mobilePhone,
        locationIds: selectedLocations,
        parentId: userDetail.parentId,
        roleId: userDetail.roleId,
        isActive: userDetail.isActive,
        password: "",
        confirmPassword: "",
        isSendMail: userDetail.isSendMail,
        isSendSms: userDetail.isSendSms,
      });
    } else {
      formik.setValues({
        name: "",
        email: "",
        mobilePhone: "",
        locationIds: [],
        parentId: null,
        roleId: "",
        password: "",
        confirmPassword: "",
        isActive: true,
        isSendMail: false,
        isSendSms: false,
      });
    }
  }, [userDetail, locationSelectedItems]);

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
      header={modalType !== Mode.EDIT ? "Kullanıcı Ekle" : "Kullanıcı Düzenle"}
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
        <Input className="w-full" errorMsg={getFormErrorMessage(formik, "mobilePhone")} label="Telefon Numarası" name="mobilePhone" value={formik.values.mobilePhone} onChange={formik.handleChange} required={true} keyfilter="int" maxLength="10" />
        <Input className="w-full" errorMsg={getFormErrorMessage(formik, "email")} label="E-posta" name="email" value={formik.values.email} onChange={formik.handleChange} required={true} />
        <Input type="password" className="w-full" errorMsg={getFormErrorMessage(formik, "password")} label="Parola" name="password" value={formik.values.password} onChange={formik.handleChange} required={true} />
        <Input type="password" className="w-full" errorMsg={getFormErrorMessage(formik, "confirmPassword")} label="Parola Onay" name="confirmPassword" value={formik.values.confirmPassword} onChange={formik.handleChange} required={true} />
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

        <div className="col-12 flex align-items-center" style={{ gap: "10px" }}>
        <div className= "p-2 flex align-items-center" style={{ border: "2px solid #ced4da", borderRadius: "5px",gap:"5px" }}>
            <Checkbox name="isSendMail" onChange={formik.handleChange} checked={formik.values.isSendMail} value={formik.values.isSendMail}></Checkbox>
            <label className="p-checkbox-label flex align-items-center"> Mail ile Bilgilendir</label>
          </div>
          <div className= "p-2 flex align-items-center" style={{ border: "2px solid #ced4da", borderRadius: "5px",gap:"5px" }}>
            <Checkbox name="isSendSms" onChange={formik.handleChange} checked={formik.values.isSendSms} value={formik.values.isSendSms}></Checkbox>
            <label className="p-checkbox-label flex align-items-center"> Sms ile Bilgilendir</label>
          </div>
        </div>
        <CustomDropdown className="w-full" label="Rol Seçiniz" errorMsg={getFormErrorMessage(formik, "roleId")} options={roleSelectedItems} optionLabel="value" optionValue="key" name="roleId" inputId="roleId" value={formik.values.roleId} onChange={formik.handleChange} />
        <CustomDropdown className="w-full" label="Üst Kullanıcı Seçiniz" errorMsg={getFormErrorMessage(formik, "parentId")} options={userSelectedItems} optionLabel="value" optionValue="key" name="parentId" inputId="parentId" value={formik.values.parentId} onChange={formik.handleChange} />
        <CustomDropdown
          type="tree"
          selectionMode="checkbox"
          className="w-full"
          label="Mahal Seçiniz"
          errorMsg={getFormErrorMessage(formik, "locationIds")}
          options={alllocations}
          optionLabel="value"
          optionValue="key"
          name="locationIds"
          inputId="locationIds"
          value={formik.values.locationIds}
          onChange={formik.handleChange}
        />
      </div>
    </Dialog>
  );
}

function User() {
  const { setLoading } = useContext(LoadingContext);
  const [first, setFirst] = useState(0);
  const [userId, setUserId] = useState("");
  const [opened, open, close] = useDialogState();
  const [modalType, setModalType] = useState();
  const [payload, setPayload] = useState({
    page: 1,
    pageSize: 50,
    isActive: true,
  });

  const [users, reloadUsers] = useFetch(() => getAllUser(payload), {}, { setLoading, reloadDeps: [payload], deps: [payload] });
  const [userSelectedItems] = useFetch(() => getUserSelectedItems(), [], { setLoading, reloadDeps: [], deps: [] });
  const [roleSelectedItems] = useFetch(() => getRoleSelectedItems(), [], { setLoading, reloadDeps: [], deps: [] });
  const items = [
    {
      label: "Kullanıcı Adı",
      name: "name",
      component: "input",
      type: "text",
    },
    {
      label: "E-posta",
      name: "email",
      component: "input",
      type: "text",
    },
    {
      label: "Üst Kullanıcı",
      name: "parentId",
      component: "dropdown",
      options: userSelectedItems,
      optionLabel: "value",
      optionValue: "key",
    },
    {
      label: "Rol",
      name: "roleId",
      component: "dropdown",
      options: roleSelectedItems,
      optionLabel: "value",
      optionValue: "key",
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
    setUserId(id);
    open();
  };

  const handleExport = async () => {
    const [, res] = await tryCatch(getAllUser({ pageSize: -1 }));

    exportExcel(res.results, "users");
  };

  const renderHeader = () => <Button label="Dışa Aktar" type="button" icon="pi pi-file-excel" onClick={() => handleExport()} className="p-button-success mr-2" data-pr-tooltip="XLS" />;

  return (
    <div className="grid">
      <div className="col-12">
        <SearchBar items={items} handleSearch={(data) => handleSearch(data)} />
        <div className="card">
          <h5>Kullanıcı Listesi</h5>
          <Divider />
          <ActionButtons>
            <Button code={Authority.UserManagment_Insert} label="Ekle" onClick={() => openModalType("add")} />
          </ActionButtons>
          <Divider />
          <DataTable header={renderHeader} value={users?.results} showGridlines rows={50} responsiveLayout="scroll" emptyMessage="Veri bulunmamakta.">
            <Column sortable field="name" header="Kullanıcı Adı" style={{ minWidth: "12rem" }} />
            <Column sortable field="email" header="Email" style={{ minWidth: "12rem" }} />
            <Column sortable field="mobilePhone" header="Telefon Numarası" style={{ minWidth: "12rem" }} />
            <Column sortable field="roleName" header="Rol Adı" style={{ minWidth: "12rem" }} />
            <Column sortable field="parentId" header="Üst Kullanıcı Id" style={{ minWidth: "12rem" }} />
            <Column header="Durum" style={{ minWidth: "12rem" }} body={(rowData) => (rowData.isActive ? "Aktif" : "Pasif")} />
            <Column
              header="Aksiyon"
              headerStyle={{ width: "4rem", textAlign: "center" }}
              bodyStyle={{ textAlign: "center", overflow: "visible" }}
              body={(rowData) => {
                return (
                  <ActionButtons>
                    <Button code={Authority.UserManagment_Edit} type="button" label="Düzenle" onClick={() => openModalType(Mode.EDIT, rowData.id)} />
                  </ActionButtons>
                );
              }}
            />
          </DataTable>
          <Paginator first={first} rows={50} totalRecords={users.rowCount} onPageChange={(e) => onPageChange(e)}></Paginator>
        </div>
      </div>
      {opened && <AddModal open={open} close={close} opened={opened} reloadUsers={reloadUsers} modalType={modalType} id={userId} users={users} userSelectedItems={userSelectedItems} roleSelectedItems={roleSelectedItems} />}
    </div>
  );
}

export default User;
