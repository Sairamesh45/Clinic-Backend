import { successResponse } from "../../utils/apiResponse.js";
import { listPatients, createPatient } from "./patient.service.js";
import { listPatientVitalsForUser, createVitalForUser } from "./patientVitals.service.js";
import { getPatientAiSummary, getPatientLabReport, getPatientTimeline } from "./aiSummary.service.js";

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

export const createPatientVital = async (req, res, next) => {
  try {
    const rawPatientId = parseInt(req.params.id, 10);
    if (Number.isNaN(rawPatientId)) {
      return res.status(400).json({ status: "error", message: "Invalid patient id" });
    }
    const vital = await createVitalForUser({
      patientIdParam: rawPatientId,
      user: req.user,
      body: req.body,
    });
    res.status(201).json(successResponse(vital));
  } catch (error) {
    next(error);
  }
};

// ── AI Summarizer proxies ─────────────────────────────────────────────────────

export const getAiSummary = async (req, res, next) => {
  try {
    const patientId = req.params.id;
    const authHeader = req.headers.authorization;
    const data = await getPatientAiSummary(patientId, authHeader);
    res.status(200).json(successResponse(data));
  } catch (error) {
    next(error);
  }
};

export const getAiLabReport = async (req, res, next) => {
  try {
    const patientId = req.params.id;
    const authHeader = req.headers.authorization;
    const data = await getPatientLabReport(patientId, authHeader);
    res.status(200).json(successResponse(data));
  } catch (error) {
    next(error);
  }
};

export const getAiTimeline = async (req, res, next) => {
  try {
    const patientId = req.params.id;
    const authHeader = req.headers.authorization;
    const { view, limit, offset } = req.query;
    const data = await getPatientTimeline(patientId, { view, limit, offset }, authHeader);
    res.status(200).json(successResponse(data));
  } catch (error) {
    next(error);
  }
};
