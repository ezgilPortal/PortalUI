import { tryCatch } from "@thalesrc/js-utils";
import http from "./http";
import { GET_IOT_PRODUCT_COUNT_URL, GET_IOT_PRODUCT_ERROR_DATE_URL, GET_IOT_PRODUCT_ERROR_URL, GET_IOT_PRODUCT_FIRE_URL, GET_IOT_PRODUCT_FIRE_DATE_URL, GET_IOT_PASSIVE_PRODUCT_COUNT_URL,GET_IOT_ACTIVE_PRODUCT_COUNT_URL } from "../utils/url";

export async function getIotProductCount() {
  const [error, result] = await tryCatch(http.get(GET_IOT_PRODUCT_COUNT_URL));

  if (error) throw error;

  return result.data.data;
}

export async function getIotPassiveDeviceCount() {
  const [error, result] = await tryCatch(http.get(GET_IOT_PASSIVE_PRODUCT_COUNT_URL));

  if (error) throw error;

  return result.data.data;
}

export async function getIotActiveDeviceCount() {
  const [error, result] = await tryCatch(http.get(GET_IOT_ACTIVE_PRODUCT_COUNT_URL));

  if (error) throw error;

  return result.data.data;
}


export async function getIotProductErrorCount() {
  const [error, result] = await tryCatch(http.get(GET_IOT_PRODUCT_ERROR_URL));

  if (error) throw error;

  return result.data.data;
}

export async function getIotProductFireCount() {
  const [error, result] = await tryCatch(http.get(GET_IOT_PRODUCT_FIRE_URL));

  if (error) throw error;

  return result.data.data;
}

export async function getIotProductFireDateCount() {
  const [error, result] = await tryCatch(http.get(GET_IOT_PRODUCT_FIRE_DATE_URL));

  if (error) throw error;

  return result.data.data;
}

export async function getIotProductErrorDateCount() {
  const [error, result] = await tryCatch(http.get(GET_IOT_PRODUCT_ERROR_DATE_URL));

  if (error) throw error;

  return result.data.data;
}
