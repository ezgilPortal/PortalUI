const isFormFieldValid = (formik, name) => !!(formik.touched[name] && formik.errors[name]);

export const getFormErrorMessage = (formik, name) => {
  return formik && isFormFieldValid(formik, name) && <small className="p-error">{formik.errors[name]}</small>;
};
