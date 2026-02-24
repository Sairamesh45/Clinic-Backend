import { successResponse, createdResponse } from "../../utils/apiResponse.js";
import prisma from "../../prisma/client.js";
import {
  listAppointmentsForUser,
  createAppointmentRecord,
  markAppointmentArrived,
  moveNextAppointmentToConsultation,
  markAppointmentCompleted,
  getAppointmentQueue,
  cancelAppointment,
} from "./appointment.service.js";

export const getAppointments = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    const filters = {
      patientId: req.query.patientId,
      status: req.query.status,
      upcoming: req.query.upcoming,
    };

    const pagination = {
      page: req.query.page,
      limit: req.query.limit,
    };

    const { items, meta } = await listAppointmentsForUser({
      user: req.user,
      filters,
      pagination,
    });

    res.status(200).json(successResponse(items, meta));
  } catch (error) {
    next(error);
  }
};

export const createAppointment = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    // If user is authenticated and is a patient, use their patientId
    let patientId = req.body.patientId;
    
    if (req.user.patientId) {
      patientId = req.user.patientId;
    } else if (req.user.roles?.includes('patient')) {
      // If user is a patient but doesn't have patientId linked, find or create patient
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { patient: true }
      });
      
      if (!user.patient) {
        // Create patient for this user
        const patient = await prisma.patient.create({
          data: {
            name: user.name || 'Patient',
            email: user.email,
          },
        });
        
        // Link patient to user
        await prisma.user.update({
          where: { id: user.id },
          data: { patientId: patient.id },
        });
        
        patientId = patient.id;
      } else {
        patientId = user.patient.id;
      }
    }

    if (!patientId) {
      return res.status(400).json({ status: "error", message: "Unable to determine patient identity" });
    }

    const appointment = await createAppointmentRecord({
      ...req.body,
      patientId,
      status: req.body.status || 'BOOKED',
    });
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
