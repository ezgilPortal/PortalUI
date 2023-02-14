/* eslint-disable no-undef */
import React, { useContext, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import PageActions from "../../components/PageActions";
import { useFetch } from "../../hooks/use-fetch";
import { getAuthorityDetail, updateAuthority, addAuthority } from "../../service/authority";
import { LoadingContext } from "../../context/Loading";
import { useFormik } from "formik";
import { tryCatch } from "@thalesrc/js-utils";
import { ToasterContext } from "../../context/ToasterContext";
import CustomForm from "../../components/CustomForm";

const AuthorityAction = () => {
  const history = useHistory();
  const { id } = useParams();
  const { mode } = useParams();
  const { setLoading, showLoading, hideLoading } = useContext(LoadingContext);
  const [authorityDetail, reloadAuthorityDetail] = useFetch(() => (id ? getAuthorityDetail(id) : () => {}), {}, { setLoading, reloadDeps: [id], deps: [id] });
  const { openToaster } = useContext(ToasterContext);

  useEffect(() => {
    if (mode === "edit") {
      formik.setValues({
        ...authorityDetail,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorityDetail]);

  const btnItems = [
    { label: "Geri Dön", onClick: () => history.goBack(), className: "p-button-raised p-button-text" },
    {
      label: "Kaydet",
      type: "submit",
      onClick: () => {
        formik.handleSubmit();
      },
    },
  ];

  const formik = useFormik({
    initialValues: {
      name: "",
      code: "",
      description: "",
      parentId: "",
      isActive: true,
    },
    onSubmit: async (data) => {
      showLoading();
      const [err, res] = await tryCatch(mode === "edit" ? updateAuthority(data) : addAuthority(data));

      if (err) {
        hideLoading();
        openToaster("bottom-right", { severity: "error", summary: err?.response?.status, detail: err?.response?.data?.message, life: 3000 });
        return;
      }
      hideLoading();
      formik.resetForm();
      reloadAuthorityDetail();
      openToaster("bottom-right", { severity: "success", summary: res?.httpStatusCodeName, detail: res?.responseCodeName, life: 3000 });
      history.goBack();
    },
  });

  const items = [
    {
      label: "Yetki İsmi",
      name: "name",
      component: "input",
    },
    {
      label: "Kod",
      name: "code",
      component: "input",
    },
    {
      label: "Üst Yetki Id",
      name: "parentId",
      component: "input",
    },
    {
      label: "Açıklama",
      name: "description",
      component: "textarea",
    },
    {
      label: "Durum",
      name: "isActive",
      component: "radio",
    },
  ];

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <CustomForm items={items} formik={formik} handleChange={formik.handleChange} mode={mode} />
        </div>
        <PageActions items={btnItems} />
      </div>
    </div>
  );
};

export default AuthorityAction;
