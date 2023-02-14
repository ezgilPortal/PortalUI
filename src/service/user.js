import { tryCatch } from "@thalesrc/js-utils";
import http from "./http";
import { ADMIN_ROLE_URL, ALL_ADMIN_ROLE_URL, ROLE_SELECTED_ITEM_URL, USER_RESET_PASSWORD_URL, USER_SELECTED_ITEM_URL, USER_STATUS_URL, USER_URL } from "../utils/url";
import { pathWithQueryString } from "../helpers/pathWithQueryString";

export async function getAllUser(payload) {
  const url = pathWithQueryString(USER_URL, payload);

  const [error, result] = await tryCatch(http.get(url));

  if (error) throw error;

  return result.data.data;
}

export async function addUser(payload) {
  const [error, result] = await tryCatch(http.post(USER_URL, payload));

  if (error) throw error;

  return result.data.data;
}

export async function getUserDetail(id) {
  const [error, result] = await tryCatch(http.get(USER_URL + "/" + id));

  if (error) throw error;

  return result.data.data;
}

export async function updateUser(payload) {
  const url = USER_URL;

  const [error, result] = await tryCatch(http.put(url, payload));

  if (error) throw error;

  return result.data.data;
}

export async function userStatusUpdate(id) {
  const url = USER_STATUS_URL + "/" + id;

  const [error, result] = await tryCatch(http.put(url));

  if (error) throw error;

  return result.data.data;
}

export async function resetPassword(id) {
  const url = USER_RESET_PASSWORD_URL + "/" + id;

  const [error, result] = await tryCatch(http.put(url));

  if (error) throw error;

  return result.data.data;
}

export async function getAllRole(payload) {
  const url = ALL_ADMIN_ROLE_URL;

  const [error, result] = await tryCatch(http.get(url));

  if (error) throw error;

  return result.data.data;
}

export async function getRoles(payload) {
  const url = pathWithQueryString(ADMIN_ROLE_URL, payload);

  const [error, result] = await tryCatch(http.get(url));

  if (error) throw error;

  return result.data.data;
}

export async function addRole(payload) {
  const [error, result] = await tryCatch(http.post(ADMIN_ROLE_URL, payload));

  if (error) throw error;

  return result.data.data;
}

export async function updateRole(payload) {
  const [error, result] = await tryCatch(http.put(ADMIN_ROLE_URL, payload));

  if (error) throw error;

  return result.data.data;
}

export async function detailRole(id) {
  const [error, result] = await tryCatch(http.get(ADMIN_ROLE_URL + "/" + id));

  if (error) throw error;

  return result.data.data;
}

export async function disableRole(id) {
  const [error, result] = await tryCatch(http.delete(ADMIN_ROLE_URL + "/" + id));

  if (error) throw error;

  return result.data.data;
}

export async function getUserSelectedItems() {
  const [error, result] = await tryCatch(http.get(USER_SELECTED_ITEM_URL));

  if (error) throw error;

  return result.data.data;
}

export async function getRoleSelectedItems() {
  const [error, result] = await tryCatch(http.get(ROLE_SELECTED_ITEM_URL));

  if (error) throw error;

  return result.data.data;
}
