import { tryCatch } from "@thalesrc/js-utils";
import http from "./http";
import { SERVICE_FORM } from "../utils/url";
import { pathWithQueryString } from "../helpers/pathWithQueryString";

export async function getServiceForms(payload) {
  const url = pathWithQueryString(SERVICE_FORM, payload);

  const [error, result] = await tryCatch(http.get(url));

  if (error) throw error;

  return result.data.data;
}

export async function getServiceFormDetail(id) {
  const url = `${SERVICE_FORM}/${id}`;

  const [error, result] = await tryCatch(http.get(url));

  if (error) throw error;

  return result.data.data;
}

export async function addServiceForm(payload) {
  const url = SERVICE_FORM;

  const [error, result] = await tryCatch(http.post(url, payload));

  if (error) throw error;

  return result.data;
}

export async function updateServiceForm(payload) {
  const url = SERVICE_FORM;

  const [error, result] = await tryCatch(http.put(url, payload));

  if (error) throw error;

  return result.data;
}
