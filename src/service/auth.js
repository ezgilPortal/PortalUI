import { tryCatch } from "@thalesrc/js-utils";
import { GET_CUSTOMER_URL, LOGIN_URL } from "../utils/url";
import http from "./http";

export async function loginUser(payload) {
  const url = LOGIN_URL;

  const [error, result] = await tryCatch(http.post(url, payload));

  if (error) throw error;

  return result.data.data;
}

export async function getCustomer() {
  const url = GET_CUSTOMER_URL;

  const [error, result] = await tryCatch(http.get(url));

  if (error) throw error;

  return result.data.data;
}
