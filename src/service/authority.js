import { tryCatch } from "@thalesrc/js-utils";
import http from "./http";
import { AUTHORITY_ALL_URL, AUTHORITY_URL } from "../utils/url";
import { pathWithQueryString } from "../helpers/pathWithQueryString";

export async function getAllAuthority() {
  const url = AUTHORITY_ALL_URL;

  const [error, result] = await tryCatch(http.get(url));

  if (error) throw error;

  return result.data.data;
}
export async function getAuthority(payload) {
  const url = pathWithQueryString(AUTHORITY_URL, payload);

  const [error, result] = await tryCatch(http.get(url));

  if (error) throw error;

  return result.data.data;
}


export async function getAuthorityDetail(id) {
  const url = `${AUTHORITY_URL}/${id}`;

  const [error, result] = await tryCatch(http.get(url));

  if (error) throw error;

  return result.data.data;
}

export async function updateAuthority(payload) {
    const url = AUTHORITY_URL;

    const [error, result] = await tryCatch(http.put(url, payload));

    if (error) throw error;

    return result.data;
  }

  export async function addAuthority(payload) {
    const url = AUTHORITY_URL;

    const [error, result] = await tryCatch(http.post(url, payload));

    if (error) throw error;

    return result.data;
  }

  export async function deleteAuthority(id) {
    const url = `${AUTHORITY_URL}/${id}`;

    const [error, result] = await tryCatch(http.delete(url));

    if (error) throw error;

    return result.data.data;
  }
