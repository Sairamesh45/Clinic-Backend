import { createHttpError } from "./httpError.js";

export const parseDayOfWeek = (value) => {
  if (value === undefined || value === null) {
    throw createHttpError(400, "day_of_week is required");
  }

  const day = Number(value);
  if (Number.isNaN(day) || day < 0 || day > 6) {
    throw createHttpError(400, "day_of_week must be between 0 and 6");
  }

  return day;
};

export const parseTimeValue = (value, { required = false } = {}) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    if (required) {
      throw createHttpError(400, "Time value is required");
    }
    return null;
  }

  const trimmed = String(value).trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) {
    throw createHttpError(400, "Time must be formatted as HH:MM or HH:MM:SS");
  }

  const [, rawHour, rawMinute, rawSecond] = match;
  const hour = Number(rawHour);
  const minute = Number(rawMinute);
  const second = rawSecond ? Number(rawSecond) : 0;

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
    throw createHttpError(400, "Time values must be within valid ranges");
  }

  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:${second
    .toString()
    .padStart(2, "0")}`;
};

export const ensureStartBeforeEnd = (startTime, endTime) => {
  if (startTime && endTime) {
    if (startTime >= endTime) {
      throw createHttpError(400, "start_time must come before end_time");
    }
  }
};

export const parsePositiveInteger = (value, name) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw createHttpError(400, `${name} must be a positive integer`);
  }
  return parsed;
};
