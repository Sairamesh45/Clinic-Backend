import { successResponse } from "../../utils/apiResponse.js";
import { listPatients, createPatient } from "./patient.service.js";
import { listPatientVitalsForUser } from "./patientVitals.service.js";

export const getPatients = async (_req, res, next) => {
  try {
    const patients = await listPatients();
    res.status(200).json(successResponse(patients));
  } catch (error) {
    next(error);
  }
};

export const registerPatient = async (req, res, next) => {
  try {
    const patient = await createPatient(req.body);
    res.status(201).json(successResponse(patient));
  } catch (error) {
    next(error);
  }
};

export const getPatientVitals = async (req, res, next) => {
  try {
    const rawPatientId = parseInt(req.params.id, 10);
    if (Number.isNaN(rawPatientId)) {
      return res.status(400).json({ status: "error", message: "Invalid patient id" });
    }

    const vitals = await listPatientVitalsForUser({
      patientIdParam: rawPatientId,
      user: req.user,
      limitParam: req.query.limit,
    });

    res.status(200).json(successResponse(vitals));
  } catch (error) {
    next(error);
  }
};
