import React from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import styled from "styled-components";
import media from "../utils/media";
import { Divider } from "primereact/divider";

const Container = styled.div`
  input {
    min-width: ${(p) => p.minWidth};

    ${media.xs`
      min-width: 100%;
    `}
  }

  .p-password input {
    width: 100%;
  }
`;

const footer = (
  <React.Fragment>
    <ul className="pl-2 ml-2 mt-0" style={{ lineHeight: "1.5" }}>
      <Divider />
      <li>En az bir küçük harf</li>
      <li>En az bir büyük harf</li>
      <li>En az bir rakam</li>
      <li>En az 6 karakter</li>
    </ul>
  </React.Fragment>
);

function Input({tooltipOptions, tooltip, errorMsg, disabled, className, containerClassName, onChange, value, name, label, required = false, minWidth = "250px", maxLength, keyfilter, type = "text", containerStyle = {} }) {
  return (
    <Container minWidth={minWidth} className={containerClassName} style={containerStyle}>
      <span className="p-float-label">
        {type === "password" ? (
          <Password
            weakLabel="Zayıf"
            mediumLabel="Orta"
            strongLabel="Güçlü"
            mediumRegex="^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})."
            promptLabel="Güçlü bir parola belirleyin."
            disabled={disabled}
            id={name}
            value={value}
            name={name}
            onChange={onChange}
            className={className}
            style={containerStyle}
            footer={footer}
            toggleMask={true}
          />
        ) : (
          <InputText disabled={disabled} type={type} id={name} value={value} name={name} onChange={onChange} autoComplete="off" className={className} maxLength={maxLength} keyfilter={keyfilter} style={containerStyle} tooltipOptions={tooltipOptions} tooltip={tooltip} />
        )}
        <label htmlFor={name}>
          {required && <span className="text-pink-500">*</span>}
          {label}
        </label>
      </span>
      {errorMsg && errorMsg}
    </Container>
  );
}

export default Input;
