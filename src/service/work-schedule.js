import { tryCatch } from "@thalesrc/js-utils";
import http from "./http";
import { WORK_SCHEDULE } from "../utils/url";
import { pathWithQueryString } from "../helpers/pathWithQueryString";

export async function getWorkSchedules(payload) {
  const url = pathWithQueryString(WORK_SCHEDULE, payload);

  const [error, result] = await tryCatch(http.get(url));

  if (error) throw error;

  return result.data.data;
}

export async function getWorkScheduleDetail(id) {
  const url = `${WORK_SCHEDULE}/${id}`;

  const [error, result] = await tryCatch(http.get(url));

  if (error) throw error;

  return result.data.data;
}

export async function addWorkSchedule(payload) {
  const url = WORK_SCHEDULE;

  const [error, result] = await tryCatch(http.post(url, payload));

  if (error) throw error;

  return result.data;
}

export async function updateWorkSchedule(payload) {
  const url = WORK_SCHEDULE;

  const [error, result] = await tryCatch(http.put(url, payload));

  if (error) throw error;

  return result.data;
}
