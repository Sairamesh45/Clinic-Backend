import express from "express";
import authenticate from "../../middleware/authenticate.js";
import { getPatients, getPatientVitals, createPatientVital, registerPatient, getAiSummary, getAiLabReport, getAiTimeline } from "./patient.controller.js";

const router = express.Router();

router.post("/", registerPatient);
router.get("/:id/vitals", authenticate, getPatientVitals);
router.post("/:id/vitals", authenticate, createPatientVital);
router.get("/:id/ai-summary", authenticate, getAiSummary);
router.get("/:id/ai-lab-report", authenticate, getAiLabReport);
router.get("/:id/ai-timeline", authenticate, getAiTimeline);
router.get("/", getPatients);

export default router;
