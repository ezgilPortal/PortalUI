import { tryCatch } from "@thalesrc/js-utils";
import http from "./http";
import { LOCATION_SELECTED_BY_PARENT_URL, LOCATION_SELECTED_ITEM_URL, LOCATION_SELECTED_ITEM_URL_ALL, LOCATION_URL, PRODUCTNONIOTTYPE_SELECTED_ITEM_URL } from "../utils/url";
import { pathWithQueryString } from "../helpers/pathWithQueryString";

export async function getlocationAllItems() {
  const url = LOCATION_SELECTED_ITEM_URL_ALL;

  const [error, result] = await tryCatch(http.get(url));

  if (error) throw error;

  return result.data.data;
}

export async function getlocationSelectedItems() {
  const url = LOCATION_SELECTED_ITEM_URL;

  const [error, result] = await tryCatch(http.get(url));

  if (error) throw error;

  return result.data.data;
}

export async function getlocationParentSelectedItems() {
  const url = LOCATION_SELECTED_ITEM_URL + "-parent";

  const [error, result] = await tryCatch(http.get(url));

  if (error) throw error;

  return result.data.data;
}

export async function getlocationByParentItem(id) {
  const url = LOCATION_SELECTED_BY_PARENT_URL + "?parentId=" + id;

  const [error, result] = await tryCatch(http.get(url));

  if (error) throw error;

  return result.data.data;
}

export async function getProductNonIotTypeSelectedItems() {
  const url = PRODUCTNONIOTTYPE_SELECTED_ITEM_URL;

  const [error, result] = await tryCatch(http.get(url));

  if (error) throw error;

  return result.data.data;
}

export async function getLocations(payload) {
  const url = pathWithQueryString(LOCATION_URL, payload);

  const [error, result] = await tryCatch(http.get(url));

  if (error) throw error;

  return result.data.data;
}

export async function getLocationDetail(id) {
  const url = `${LOCATION_URL}/${id}`;

  const [error, result] = await tryCatch(http.get(url));

  if (error) throw error;

  return result.data.data;
}

export async function updateLocation(payload) {
  const url = LOCATION_URL;

  const [error, result] = await tryCatch(http.put(url, payload));

  if (error) throw error;

  return result.data;
}

export async function addLocation(payload) {
  const url = LOCATION_URL;

  const [error, result] = await tryCatch(http.post(url, payload));

  if (error) throw error;

  return result.data;
}

export async function deleteLocation(id) {
  const url = `${LOCATION_URL}/${id}`;

  const [error, result] = await tryCatch(http.delete(url));

  if (error) throw error;

  return result.data.data;
}

let config = {
  headers: {
    "content-type": "multipart/form-data",
  },
};

export async function uploadFile(payload) {
  const [error, result] = await tryCatch(http.post(LOCATION_URL + "/upload", payload, config));

  if (error) throw error;

  return result.data.data;
}
