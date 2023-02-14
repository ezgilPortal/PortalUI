import React from "react";
import { Calendar } from "primereact/calendar";
import media from "../utils/media";
import styled from "styled-components";

const Container = styled.div`
  .p-calendar {
    min-width: ${(p) => p.minWidth};

    ${media.xs`
      min-width: 100%
    `}
  }
`;

function CustomCalendar({ minWidth = "250px", name, label, onChange, value, selectionMode, className, errorMsg, disabled, showTime, showSeconds }) {
  return (
    <Container minWidth={minWidth}>
      <span className="p-float-label">
        <Calendar showTime={showTime} showSeconds={showSeconds} disabled={disabled} id={name} value={value} onChange={onChange} dateFormat="dd/mm/yy" selectionMode={selectionMode} className={className} />
        <label htmlFor={name}>{label}</label>
      </span>
      {errorMsg && errorMsg}
    </Container>
  );
}

export default CustomCalendar;
