import React from "react";
import { Dropdown } from "primereact/dropdown";
import styled from "styled-components";
import media from "../utils/media";
import { MultiSelect } from "primereact/multiselect";
import { TreeSelect } from "primereact/treeselect";

const Container = styled.div`
  .p-dropdown {
    min-width: ${(p) => p.minWidth};

    ${media.xs`
      min-width: 200px
    `}
  }

  .p-treeselect {
    min-width: ${(p) => p.minWidth};

    ${media.xs`
      min-width: 200px
    `}
  }

  .p-treeselect-token {
    background: #0066b3 !important;
    color: #fff !important;
  }
`;

function CustomDropdown({ filter = true, showClear = false, name, label, options, onChange, onFocus, value, className, errorMsg, optionLabel, optionValue, disabled, type = "single", containerStyle = {}, dropdownIcon = "pi pi-chevron-down", minWidth = "250px", selectionMode = "single" }) {
  return (
    <Container minWidth={minWidth} style={containerStyle}>
      <span className="p-float-label">
        {type === "single" ? (
          <Dropdown
            filter={filter}
            showClear={showClear}
            onFocus={onFocus}
            showOnFocus={true}
            dropdownIcon={dropdownIcon}
            style={containerStyle}
            className={className}
            name={name}
            inputId={name}
            options={options}
            value={value}
            onChange={onChange}
            optionLabel={optionLabel}
            optionValue={optionValue}
            disabled={disabled}
            autoComplete={false}
          />
        ) : type === "tree" ? (
          <TreeSelect className={className} name={name} inputId={name} value={value} options={options} onChange={onChange} disabled={disabled} autoComplete="false" display="chip" selectionMode={selectionMode}></TreeSelect>
        ) : (
          <MultiSelect className={className} name={name} inputId={name} options={options} value={value} onChange={onChange} optionLabel={optionLabel} optionValue={optionValue} disabled={disabled} autoComplete="false" />
        )}
        <label htmlFor={name}>{label}</label>
      </span>
      {errorMsg && errorMsg}
    </Container>
  );
}

export default CustomDropdown;
