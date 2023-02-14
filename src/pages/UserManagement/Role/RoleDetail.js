/* eslint-disable array-callback-return */
/* eslint-disable no-unused-expressions */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import { tryCatch } from "@thalesrc/js-utils";
import { Divider } from "primereact/divider";
import React, { useContext, useEffect, useState } from "react";
import { Tree } from "primereact/tree";
import { useHistory, useParams } from "react-router-dom";
import Input from "../../../components/Input";
import PageActions from "../../../components/PageActions";
import { LoadingContext } from "../../../context/Loading";
import { ToasterContext } from "../../../context/ToasterContext";
import { useFetch } from "../../../hooks/use-fetch";
import { getAllAuthority } from "../../../service/authority";
import { useFormik } from "formik";
import { addRole, detailRole, updateRole } from "../../../service/user";
import Textarea from "../../../components/Textarea";
import pageURL from "../../../utils/pageUrls";
import CustomDropdown from "../../../components/Dropdown";
import { getCustomer } from "../../../service/auth";
import { UserContext } from "../../../context/UserContext";

function RoleDetail() {
  const { setLoading, hideLoading, showLoading } = useContext(LoadingContext);
  const { id, mode } = useParams();
  const history = useHistory();
  const { openToaster } = useContext(ToasterContext);
  const [nodes, setNodes] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState({});
  const { setUser } = useContext(UserContext);

  const [allAuthority] = useFetch(() => getAllAuthority(), {}, { setLoading, reloadDeps: [], deps: [] });
  const [roleDetail] = useFetch(() => (mode === "edit" ? detailRole(id) : {}), [], { setLoading, reloadDeps: [], deps: [] });

  const handleConfirm = async () => {
    formik.handleSubmit();
  };

  const btnItems = [
    { label: "Geri Dön", onClick: () => history.goBack(), className: "p-button-raised p-button-text" },
    { label: "Kaydet", onClick: () => handleConfirm() },
  ];

  const expandAll = (nodesAll) => {
    let _expandedKeys = {};
    for (let node of nodesAll) {
      expandNode(node, _expandedKeys);
    }

    setExpandedKeys(_expandedKeys);
  };

  const expandNode = (node, _expandedKeys) => {
    if (node.children && node.children.length) {
      _expandedKeys[node.key] = true;

      for (let child of node.children) {
        expandNode(child, _expandedKeys);
      }
    }
  };

  const generateChild = (arr) => {
    return arr.reduce((acc, val, _ind, array) => {
      const children = [];
      array.forEach((el) => {
        if (children.includes(el.parentId) || el.parentId === val.id) {
          children.push({ ...el, label: el.name, key: el.id });
        }
      });
      if (children.length > 0) {
        return acc.concat({ ...val, label: val.name, key: val.id, children });
      } else {
        return acc.concat({ ...val, label: val.name, key: val.id });
      }
    }, []);
  };

  const authorityChange = (value) => {
    formik.setFieldValue("authorityIds", value);
  };

  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>;
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      isActive: true,
      description: "",
      authorityIds: [],
    },
    validate: (values) => {
      const errors = {};

      if (!values.name) {
        errors.name = "Rol adı boş olamaz";
      }

      if (!values.description) {
        errors.description = "Açıklaması boş olamaz";
      }

      if (values.authorityIds?.length === 0) {
        errors.authorityIds = "Lütfen en az bir izin seçiniz";
      }
      return errors;
    },
    onSubmit: async (formData) => {
      showLoading();
      if (mode === "add") {
        const payload = { ...formData, authorityIds: Object.keys(formData.authorityIds).map((item) => Number(item)) };
        const [err] = await tryCatch(addRole(payload));

        if (err) {
          hideLoading();
          openToaster("bottom-right", { severity: "error", summary: err?.response?.data?.externalResponseCodeName, detail: err?.response?.data?.message, life: 3000 });
          return;
        }
        hideLoading();
        history.push(pageURL.RoleManagement);
      } else if (mode === "edit") {
        const payload = { ...formData, authorityIds: Object.keys(formData.authorityIds).map((item) => Number(item)) };
        const [err] = await tryCatch(updateRole(payload));

        if (err) {
          hideLoading();
          openToaster("bottom-right", { severity: "error", summary: err?.response?.data?.externalResponseCodeName, detail: err?.response?.data?.message, life: 3000 });
          return;
        }

        await getCustomer()
          .then((response) => {
            setUser(response);
          })
          .catch((error) => {
            openToaster("bottom-right", { severity: "error", summary: error?.response?.data?.externalResponseCodeName, detail: error?.response?.data?.message, life: 3000 });
          });

        hideLoading();
        history.push(pageURL.RoleManagement);
      }
    },
  });

  useEffect(() => {
    if (mode !== "add") {
      const selectedRoles = [];
      roleDetail?.authorities?.map((item) => {
        if (item.isSelected) {
          if (item.id === 1) {
            if (allAuthority.length !== roleDetail.authorities.filter((subItem) => subItem.isSelected).length) {
              selectedRoles[item.id] = { checked: false, partialChecked: true };
            } else {
              selectedRoles[item.id] = { checked: item.isSelected };
            }
          } else {
            selectedRoles[item.id] = { checked: item.isSelected };
          }
        }
      });

      formik.setValues({
        id: roleDetail?.id,
        name: roleDetail?.name,
        isActive: roleDetail.isActive,
        description: roleDetail?.description,
        adminRoleLanguages: roleDetail?.adminRoleLanguages,
        authorityIds: selectedRoles,
      });
    }
  }, [roleDetail, mode]);

  useEffect(() => {
    if (allAuthority.length > 0) {
      const children = generateChild(allAuthority.filter((item) => item.id !== 0));
      const data = generateChild(children);
      const formatNodes = generateChild(data);
      setNodes(formatNodes.filter((item) => item.parentId === 0));
      expandAll(formatNodes.filter((item) => item.parentId === 0));
    }
  }, [allAuthority]);

  return (
    <div className="grid card">
      <h4>Rol Bilgileri</h4>
      <Divider />
      <div className="col-12 md:col-6 lg:col-6">
        <div className="flex flex-column" style={{ gap: "30px" }}>
          <Input disabled={mode === "detail"} label="Rol Adı" errorMsg={getFormErrorMessage("name")} required={true} className="w-full" name="name" value={formik.values.name} onChange={formik.handleChange} type="text" />
          <CustomDropdown
            disabled={mode === "detail"}
            className="w-full"
            label="Durum"
            errorMsg={getFormErrorMessage("isActive")}
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
          <Textarea className="w-full" disabled={mode === "detail"} label="Açıklama" errorMsg={getFormErrorMessage("description")} required={true} name="description" value={formik.values.description} onChange={formik.handleChange} rows="10" maxLength={200} />

          {getFormErrorMessage("adminRoleLanguages")}
        </div>
        <PageActions className="mt-5" items={btnItems} />
      </div>
      <div className="col-12 md:col-6 lg:col-6">
        {getFormErrorMessage("authorityIds")}
        <Tree disabled={mode === "detail"} value={nodes} expandedKeys={expandedKeys} selectionMode="checkbox" onToggle={(e) => setExpandedKeys(e.value)} selectionKeys={formik.values.authorityIds} onSelectionChange={(e) => authorityChange(e.value)} />
      </div>
    </div>
  );
}

export default RoleDetail;
