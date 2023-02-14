import { tryCatch } from "@thalesrc/js-utils";
import http from "./http";
import { PRODUCT_DISPLAY_IOT_MODEL_URL, PRODUCT_IOT_MODEL_URL } from "../utils/url";
import { pathWithQueryString } from "../helpers/pathWithQueryString";

export async function getIotModels(payload) {
  const url = pathWithQueryString(PRODUCT_IOT_MODEL_URL, payload);

  const [error, result] = await tryCatch(http.get(url));

  if (error) throw error;

  return result.data.data;
}

export async function getIotModelDetail(id) {
  const url = `${PRODUCT_IOT_MODEL_URL}/${id}`;

  const [error, result] = await tryCatch(http.get(url));

  if (error) throw error;

  return result.data.data;
}

export async function updateIotModel(payload) {
  const url = PRODUCT_IOT_MODEL_URL;

  const [error, result] = await tryCatch(http.put(url, payload));

  if (error) throw error;

  return result.data;
}

export async function addIotModel(payload) {
  const url = PRODUCT_IOT_MODEL_URL;

  const [error, result] = await tryCatch(http.post(url, payload));

  if (error) throw error;

  return result.data;
}

export async function getIotModelSelectedItems() {
  const [error, result] = await tryCatch(http.get(PRODUCT_IOT_MODEL_URL + "/selected-item"));

  if (error) throw error;

  return result.data.data;
}

export async function getDisplayIotModelSelectedItems() {
  const [error, result] = await tryCatch(http.get(PRODUCT_DISPLAY_IOT_MODEL_URL));

  if (error) throw error;

  return result.data.data;
}
