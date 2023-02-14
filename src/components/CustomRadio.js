import { RadioButton } from "primereact/radiobutton";
import React from "react";

function CustomRadio({ disabled, lang, label, checked, onChange, name }) {
  return (
    <div className="pt-2">
      <div className="w-full flex align-items-center" style={{ gap: "20px" }}>
        {label && <label>{label}:</label>}
        <div className="flex align-items-center">
          <RadioButton disabled={disabled} inputId={`${lang?.name}-yes`} name={name} value={true} onChange={onChange} checked={checked === true} />
          <label className="ml-2" htmlFor={`${lang?.name}-yes`}>
            Evet
          </label>
        </div>
        <div className="flex align-items-center">
          <RadioButton disabled={disabled} inputId={`${lang?.name}-no`} name={name} value={false} onChange={onChange} checked={checked === false} />
          <label className="ml-2" htmlFor={`${lang?.name}-no`}>
            Hayır
          </label>
        </div>
      </div>
    </div>
  );
}

export default CustomRadio;
