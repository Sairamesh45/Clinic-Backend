import { successResponse, createdResponse } from "../../utils/apiResponse.js";
import {
  listAppointments,
  createAppointmentRecord,
  markAppointmentArrived,
  moveNextAppointmentToConsultation,
  markAppointmentCompleted,
  getAppointmentQueue,
  cancelAppointment,
} from "./appointment.service.js";

export const getAppointments = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.doctorId) {
      filters.doctorId = Number(req.query.doctorId);
    }
    if (req.query.status) {
      filters.status = req.query.status;
    }

    const appointments = await listAppointments(filters);
    res.status(200).json(successResponse(appointments));
  } catch (error) {
    next(error);
  }
};

export const createAppointment = async (req, res, next) => {
  try {
    const appointment = await createAppointmentRecord(req.body);
    res.status(201).json(createdResponse(appointment));
  } catch (error) {
    next(error);
  }
};

export const arriveAppointment = async (req, res, next) => {
  try {
    const appointment = await markAppointmentArrived(req.params.id);
    res.status(200).json(successResponse(appointment));
  } catch (error) {
    next(error);
  }
};

export const takeNextPatient = async (req, res, next) => {
  try {
    const appointment = await moveNextAppointmentToConsultation(req.params.doctorId);
    if (!appointment) {
      return res
        .status(404)
        .json({ status: "error", message: "No ARRIVED appointment available" });
    }
    res.status(200).json(successResponse({
      appointmentId: appointment.id,
      tokenNumber: appointment.tokenNumber,
      patient: appointment.patient,
    }));
  } catch (error) {
    next(error);
  }
};

export const completeAppointment = async (req, res, next) => {
  try {
    const appointment = await markAppointmentCompleted(req.params.id);
    res.status(200).json(successResponse(appointment));
  } catch (error) {
    next(error);
  }
};

export const cancelExistingAppointment = async (req, res, next) => {
  try {
    const appointment = await cancelAppointment(req.params.id);
    res.status(200).json(successResponse(appointment));
  } catch (error) {
    next(error);
  }
};

export const getQueue = async (req, res, next) => {
  try {
    const queue = await getAppointmentQueue(req.params.doctorId, req.query.patientId);
    res.status(200).json(successResponse(queue));
  } catch (error) {
    next(error);
  }
};
