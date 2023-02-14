import { tryCatch } from "@thalesrc/js-utils";
import http from "./http";
import {PRODUCTNONIOTTYPE_SELECTED_ITEM_URL } from "../utils/url";


export async function getProductNonIotTypeSelectedItems() {
  const url = PRODUCTNONIOTTYPE_SELECTED_ITEM_URL;

  const [error, result] = await tryCatch(http.get(url));

  if (error) throw error;

  return result.data.data;
}
