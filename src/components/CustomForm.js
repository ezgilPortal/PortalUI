/* eslint-disable array-callback-return */
import { Editor } from "primereact/editor";
import React, { useEffect, useState } from "react";
import { getFormErrorMessage } from "../utils/formikErrorCheck";
import { Mode } from "../utils/mode";
import CustomCalendar from "./CustomCalendar";
import CustomRadio from "./CustomRadio";
import CustomDropdown from "./Dropdown";
import Input from "./Input";
import Textarea from "./Textarea";

const CustomForm = ({ items, formik, handleChange, setEditor, mode }) => {
  const [formList, setFormList] = useState([]);
  useEffect(() => {
    setFormList(formik?.values);
  }, [formik]);

  return (
    <div className="flex flex-column pt-3 w-full" style={{ gap: "30px" }}>
      {items?.map((item, idx) => {
        switch (item.component) {
          case "input":
            return <Input key={idx} {...item} errorMsg={getFormErrorMessage(formik, item?.name)} disabled={item.disabled && mode !== Mode.CREATE} tooltip={item.tooltip} tooltipOptions={"top"} value={formList[item?.name] || ""} onChange={handleChange} className="w-full" />;
          case "radio":
            return <CustomRadio key={idx} name={item.name} label={item.label} disabled={mode === Mode.DETAIL} onChange={handleChange} checked={formList[item.name]} />;
          case "editor":
            return <Editor key={idx} placeholder={item.label} style={{ height: "200px" }} name={item.name} value={formList[item.name] || ""} onTextChange={(e) => setEditor(item.name, e.htmlValue)} />;
          case "calendar":
            return <CustomCalendar key={idx} label={item.label} name={item.name} value={formList[item.name] ? new Date(formList[item.name]) : ""} onChange={handleChange} className="w-full" />;
          case "textarea":
            return <Textarea errorMsg={getFormErrorMessage(formik, item.name)} key={idx} label={item.label} name={item.name} tooltip={item.tooltip} tooltipOptions={"top"} value={formList[item.name] || ""} onChange={handleChange} className="w-full" rows="10" maxLength={200} />;
          case "dropdown":
            return <CustomDropdown key={idx} {...item} value={formik.values[item.name]} onChange={handleChange} className="w-full" />;
          default:
            break;
        }
      })}
    </div>
  );
};

export default CustomForm;
