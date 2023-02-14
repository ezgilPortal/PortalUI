import { tryCatch } from "@thalesrc/js-utils";
import http from "./http";
import { CLOSE_PAST_ALARMS, GET_MALFUNTINONED_PRODUCTS, PRODUCT_IOT_URL } from "../utils/url";
import { pathWithQueryString } from "../helpers/pathWithQueryString";

export async function getIots(payload) {
  const url = pathWithQueryString(PRODUCT_IOT_URL, payload);

  const [error, result] = await tryCatch(http.get(url));

  if (error) throw error;

  return result.data.data;
}

export async function getAlarmLogs(payload) {
  const url = pathWithQueryString(PRODUCT_IOT_URL + "/alarm-log", payload);

  const [error, result] = await tryCatch(http.get(url));

  if (error) throw error;

  return result.data;
}

export async function getIotDetail(id) {
  const url = `${PRODUCT_IOT_URL}/${id}`;

  const [error, result] = await tryCatch(http.get(url));

  if (error) throw error;

  return result.data.data;
}

export async function updateIot(payload) {
  const url = PRODUCT_IOT_URL;

  const [error, result] = await tryCatch(http.put(url, payload));

  if (error) throw error;

  return result.data;
}

export async function addIot(payload) {
  const url = PRODUCT_IOT_URL;

  const [error, result] = await tryCatch(http.post(url, payload));

  if (error) throw error;

  return result.data;
}

export async function getIotSignalTypes() {
  const url = PRODUCT_IOT_URL + "/signal-type/selected-item";

  const [error, result] = await tryCatch(http.get(url));

  if (error) throw error;

  return result.data.data;
}

export async function getIotHeartbeat(id) {
  const url = PRODUCT_IOT_URL + "/heartbeat/" + id;

  const [error, result] = await tryCatch(http.get(url));

  if (error) throw error;

  return result.data.data;
}

export async function getMalfuntionedProducts() {
  const url = GET_MALFUNTINONED_PRODUCTS;

  const [error, result] = await tryCatch(http.get(url));

  if (error) throw error;

  return result.data.data;
}

export async function closePastAlarm(id) {
  const url = CLOSE_PAST_ALARMS + "?productIotId=" + id;

  const [error, result] = await tryCatch(http.put(url));

  if (error) throw error;

  return result.data.data;
}
