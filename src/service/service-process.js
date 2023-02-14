import { tryCatch } from "@thalesrc/js-utils";
import http from "./http";
import {SERVICE_PROCESS_SELECTED_ITEM_URL } from "../utils/url";

export async function getServiceProcessSelectedItems() {
  const [error, result] = await tryCatch(http.get(SERVICE_PROCESS_SELECTED_ITEM_URL));

  if (error) throw error;

  return result.data.data;
}
