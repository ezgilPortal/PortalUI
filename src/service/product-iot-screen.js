import { tryCatch } from "@thalesrc/js-utils";
import http from "./http";
import { PRODUCT_IOT_SCREEN_URL } from "../utils/url";
import { pathWithQueryString } from "../helpers/pathWithQueryString";

export async function getScreenIots(payload) {
  const url = pathWithQueryString(PRODUCT_IOT_SCREEN_URL, payload);

  const [error, result] = await tryCatch(http.get(url));

  if (error) throw error;

  return result.data.data;
}

export async function getScreenIotDetail(id) {
  const url = `${PRODUCT_IOT_SCREEN_URL}/${id}`;

  const [error, result] = await tryCatch(http.get(url));

  if (error) throw error;

  return result.data.data;
}

export async function updateScreenIot(payload) {
  const url = PRODUCT_IOT_SCREEN_URL;

  const [error, result] = await tryCatch(http.put(url, payload));

  if (error) throw error;

  return result.data;
}

export async function addScreenIot(payload) {
  const url = PRODUCT_IOT_SCREEN_URL;

  const [error, result] = await tryCatch(http.post(url, payload));

  if (error) throw error;

  return result.data;
}
