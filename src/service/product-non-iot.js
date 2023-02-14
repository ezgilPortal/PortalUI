import { tryCatch } from "@thalesrc/js-utils";
import http from "./http";
import { PRODUCT_NON_IOT_SELECTED_ITEM_URL, PRODUCT_NON_IOT_URL } from "../utils/url";
import { pathWithQueryString } from "../helpers/pathWithQueryString";

// export async function getNonIotSelectedItems() {
//   const url = LOCATION_SELECTED_ITEM_URL;

//   const [error, result] = await tryCatch(http.get(url));

//   if (error) throw error;

//   return result.data.data;
// }

export async function getNonIots(payload) {
  const url = pathWithQueryString(PRODUCT_NON_IOT_URL, payload);

  const [error, result] = await tryCatch(http.get(url));

  if (error) throw error;

  return result.data.data;
}

export async function getNonIotDetail(id) {
  const url = `${PRODUCT_NON_IOT_URL}/${id}`;

  const [error, result] = await tryCatch(http.get(url));

  if (error) throw error;

  return result.data.data;
}

export async function updateNonIot(payload) {
  const url = PRODUCT_NON_IOT_URL;

  const [error, result] = await tryCatch(http.put(url, payload));

  if (error) throw error;

  return result.data;
}

export async function addNonIot(payload) {
  const url = PRODUCT_NON_IOT_URL;

  const [error, result] = await tryCatch(http.post(url, payload));

  if (error) throw error;

  return result.data;
}

export async function getProductNonIotSelectedItems() {
  const [error, result] = await tryCatch(http.get(PRODUCT_NON_IOT_SELECTED_ITEM_URL));

  if (error) throw error;

  return result.data.data;
}
