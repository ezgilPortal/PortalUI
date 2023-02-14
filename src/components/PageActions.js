import React from "react";
import styled from "styled-components";
import { Button } from "primereact/button";

const Container = styled.div.attrs({
  className: "flex align-items-center justify-content-center",
})`
  gap: 10px;
`;

function PageActions({ items, className }, props) {
  return (
    <Container className={className}>
      {items.map((btn, idx) => {
        return <Button key={idx} {...btn} />;
      })}
    </Container>
  );
}

export default PageActions;
