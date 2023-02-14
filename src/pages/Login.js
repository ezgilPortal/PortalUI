/* eslint-disable no-useless-escape */
import React, { useContext } from "react";
import styled from "styled-components";
import { Button } from "primereact/button";
import media from "../utils/media";
import { UserContext } from "../context/UserContext";
import { useFormik } from "formik";
import Input from "../components/Input";

export default function Login() {
  const { login } = useContext(UserContext);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validate: (values) => {
      const errors = {};
      if (!values.email) {
        errors.email = "E-posta boş olamaz";
      }

      if (!values.password) {
        errors.password = "Parola boş olamaz";
      }
      return errors;
    },
    onSubmit: async (data) => {
      await login(data);
      formik.resetForm();
    },
  });

  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>;
  };

  return (
    <Container>
      <div className="welcome">
        <img className="logo" src="/ezgil-logo.svg" alt="logo"></img>
        <h1>Hoş Geldiniz</h1>
        <img src="/images/login.png" alt=""></img>
      </div>
      <div className="surface-card shadow-2">
        <h4 className="text-center">Kullanıcı Girişi</h4>
        <div className="login">
          <Input id="email" label="Email" name="email" type="text" className="w-full" containerClassName="mb-5" value={formik.values.email} onChange={formik.handleChange} errorMsg={getFormErrorMessage("email")} />
          <Input id="password" label="Parola" name="password" type="password" className="w-full" containerClassName="mb-5" value={formik.values.password} onChange={formik.handleChange} errorMsg={getFormErrorMessage("password")} />
          <Button label="Giriş Yap" icon="pi pi-user" className="w-full" onClick={() => formik.handleSubmit()} />
        </div>
      </div>
    </Container>
  );
}

export const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background-size: cover;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;

  ${media.sm`
      flex-direction: column;
      justify-content: center;
      padding: 20px;
    `}

  .surface-card {
    width: 50vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    row-gap: 20px;

    ${media.sm`
    width: 100%;
    height: auto;
    padding: 30px 0;
    border-radius: 20px;
    margin-top: 30px;
  `}

    .login {
      width: 50%;

      ${media.sm`
    width: 90%;
  `}
    }
  }

  .welcome {
    width: 50vw;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    .logo{
      width: 100px;
      position:absolute;
      left: 20px;
      top: 20px;
    }

    ${media.sm`
    width: 100%;
  `}

    img {
      width: 100%;

      ${media.sm`
      width: 90%;
      `}
    }

    h1 {
      margin-bottom: 50px;
      font-size: 72px;

      ${media.sm`
        font-size: 44px;
        margin-bottom: 20px;
    `}
    }
  }
`;
