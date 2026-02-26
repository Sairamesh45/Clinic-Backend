import { successResponse } from "../../utils/apiResponse.js";
import { createHttpError } from "../../utils/httpError.js";
import { listHoursForClinic, upsertClinicHour, deleteClinicHour } from "./clinicHours.service.js";
import { parseDayOfWeek, parseTimeValue } from "../../utils/scheduleValidators.js";

const parseClinicId = (value) => {
  const clinicId = Number(value);
  if (Number.isNaN(clinicId) || clinicId <= 0) {
    throw createHttpError(400, "Invalid clinic id");
  }
  return clinicId;
};

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  if (typeof value === "boolean") {
    return value;
  }
  const normalized = String(value).trim().toLowerCase();
  if (["true", "1", "yes"].includes(normalized)) return true;
  if (["false", "0", "no"].includes(normalized)) return false;
  throw createHttpError(400, "is_closed must be a boolean");
};

export const getClinicHours = async (req, res, next) => {
  try {
    const clinicId = parseClinicId(req.params.id);
    const hours = await listHoursForClinic(clinicId);
    res.status(200).json(successResponse(hours));
  } catch (error) {
    next(error);
  }
};

export const upsertClinicHours = async (req, res, next) => {
  try {
    const clinicId = parseClinicId(req.params.id);
    const dayOfWeek = parseDayOfWeek(req.body.dayOfWeek ?? req.body.day_of_week);
    const isClosed = parseBoolean(req.body.isClosed ?? req.body.is_closed, false);
    const normalizedOpenTime = parseTimeValue(req.body.openTime ?? req.body.open_time);
    const normalizedCloseTime = parseTimeValue(req.body.closeTime ?? req.body.close_time);

    if (!isClosed && (!normalizedOpenTime || !normalizedCloseTime)) {
      throw createHttpError(400, "open_time and close_time are required when the clinic is open");
    }

    const payload = {
      isClosed,
      openTime: isClosed ? null : normalizedOpenTime,
      closeTime: isClosed ? null : normalizedCloseTime,
    };

    const hour = await upsertClinicHour(clinicId, dayOfWeek, payload);
    res.status(200).json(successResponse(hour));
  } catch (error) {
    next(error);
  }
};

export const deleteClinicHours = async (req, res, next) => {
  try {
    const clinicId = parseClinicId(req.params.id);
    const dayOfWeek = parseDayOfWeek(req.params.day_of_week ?? req.params.dayOfWeek);
    const hour = await deleteClinicHour(clinicId, dayOfWeek);
    res.status(200).json(successResponse({ deleted: true, dayOfWeek: hour.dayOfWeek }));
  } catch (error) {
    if (error?.code === "P2025") {
      return next(createHttpError(404, "No working hours configured for the provided clinic/day"));
    }
    next(error);
  }
};
