import React, { useContext } from "react";
import { tryCatch } from "@thalesrc/js-utils";
import { useFormik } from "formik";
import { FileUpload } from "primereact/fileupload";
import CustomForm from "../components/CustomForm";
import { LoadingContext } from "../context/Loading";
import { ToasterContext } from "../context/ToasterContext";

function Device() {
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const { openToaster } = useContext(ToasterContext);

  const formik = useFormik({
    initialValues: {
      nodeId: "",
      name: "",
      description: "",
      model: "",
      location: "",
      ipAddress: "",
      publishedDate: "",
      status: true,
      deviceImage: "",
    },
    onSubmit: async (data) => {
      showLoading();
      const [err, res] = await tryCatch();

      if (err) {
        hideLoading();
        openToaster("bottom-right", { severity: "error", summary: err?.response?.status, detail: err?.response?.statusText, life: 3000 });
        return;
      }
      hideLoading();
      formik.resetForm();
      openToaster("bottom-right", { severity: "success", summary: res?.httpStatusCodeName, detail: res?.responseCodeName, life: 3000 });
    },
  });

  const formElements = [
    {
      label: "Node Id",
      name: "nodeId",
      component: "input",
      keyfilter: "pnum",
    },
    {
      label: "Name",
      name: "name",
      component: "input",
    },
    {
      label: "Model",
      name: "model",
      component: "input",
    },
    {
      label: "Description",
      name: "description",
      component: "textarea",
    },
    {
      label: "Location",
      name: "location",
      component: "input",
    },
    {
      label: "Ip Address",
      name: "ipAddress",
      component: "input",
    },
    {
      label: "Tarih",
      name: "publishedDate",
      component: "calendar",
    },
    {
      label: "Status",
      name: "status",
      component: "dropdown",
      options: [
        { label: "Enable", value: true },
        { label: "Disable", value: false },
      ],
    },
  ];

  const onChangeFile = (e, field) => {
    formik.setFieldValue(field, e.originalEvent.target.files[0]);
  };

  return (
    <div className="p-fluid grid card">
      <CustomForm items={formElements} formik={formik} handleChange={formik.handleChange} />
      <FileUpload chooseOptions={{className: "w-full"}} chooseLabel="Ürün görseli seçin" className="w-full mt-4" mode="basic" name="deviceImage" accept="image/*" maxFileSize={1000000} onSelect={(e) => onChangeFile(e, "deviceImage")} />
    </div>
  );
}

export default Device;
