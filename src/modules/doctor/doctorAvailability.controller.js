import { successResponse } from "../../utils/apiResponse.js";
import { createHttpError } from "../../utils/httpError.js";
import {
  listAvailabilityForDoctor,
  createAvailabilityBlock,
  findAvailability,
  updateAvailabilityBlock,
  deleteAvailabilityBlock,
} from "./doctorAvailability.service.js";
import { parseDayOfWeek, parseTimeValue, parsePositiveInteger, ensureStartBeforeEnd } from "../../utils/scheduleValidators.js";

const parseDoctorId = (value) => {
  const doctorId = Number(value);
  if (Number.isNaN(doctorId) || doctorId <= 0) {
    throw createHttpError(400, "Invalid doctor id");
  }
  return doctorId;
};

const parseAvailabilityId = (value) => {
  const id = Number(value);
  if (Number.isNaN(id) || id <= 0) {
    throw createHttpError(400, "Invalid availability id");
  }
  return id;
};

const ensureDoctorOwnership = (doctorId, userDoctorId) => {
  if (!userDoctorId || userDoctorId !== doctorId) {
    throw createHttpError(403, "Forbidden: can only modify your own availability");
  }
};

const buildSchedulePayload = (body) => {
  const dayOfWeek = parseDayOfWeek(body.dayOfWeek ?? body.day_of_week);
  const startTime = parseTimeValue(body.startTime ?? body.start_time, { required: true });
  const endTime = parseTimeValue(body.endTime ?? body.end_time, { required: true });
  ensureStartBeforeEnd(startTime, endTime);
  const clinicId = parsePositiveInteger(body.clinicId ?? body.clinic_id, "clinic_id");

  return { dayOfWeek, startTime, endTime, clinicId };
};

export const getDoctorAvailability = async (req, res, next) => {
  try {
    const doctorId = parseDoctorId(req.params.id);
    const availability = await listAvailabilityForDoctor(doctorId);
    res.status(200).json(successResponse(availability));
  } catch (error) {
    next(error);
  }
};

export const createDoctorAvailability = async (req, res, next) => {
  try {
    const doctorId = parseDoctorId(req.params.id);
    ensureDoctorOwnership(doctorId, req.user?.doctorId);
    const payload = buildSchedulePayload(req.body);
    const created = await createAvailabilityBlock(doctorId, payload);
    res.status(201).json(successResponse(created));
  } catch (error) {
    next(error);
  }
};

export const updateDoctorAvailability = async (req, res, next) => {
  try {
    const doctorId = parseDoctorId(req.params.id);
    ensureDoctorOwnership(doctorId, req.user?.doctorId);
    const availabilityId = parseAvailabilityId(req.params.availabilityId);
    const existing = await findAvailability(availabilityId);
    if (!existing) {
      throw createHttpError(404, "Availability block not found");
    }
    if (existing.doctorId !== doctorId) {
      throw createHttpError(403, "Cannot modify another doctor's availability");
    }

    const payload = buildSchedulePayload(req.body);
    const updated = await updateAvailabilityBlock(availabilityId, payload);
    res.status(200).json(successResponse(updated));
  } catch (error) {
    next(error);
  }
};

export const deleteDoctorAvailability = async (req, res, next) => {
  try {
    const doctorId = parseDoctorId(req.params.id);
    ensureDoctorOwnership(doctorId, req.user?.doctorId);
    const availabilityId = parseAvailabilityId(req.params.availabilityId);
    const existing = await findAvailability(availabilityId);
    if (!existing) {
      throw createHttpError(404, "Availability block not found");
    }
    if (existing.doctorId !== doctorId) {
      throw createHttpError(403, "Cannot delete another doctor's availability");
    }

    await deleteAvailabilityBlock(availabilityId);
    res.status(200).json(successResponse({ deleted: true, availabilityId }));
  } catch (error) {
    next(error);
  }
};
