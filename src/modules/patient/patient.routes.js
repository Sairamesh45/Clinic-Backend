import express from "express";
import authenticate from "../../middleware/authenticate.js";
import { getPatients, getPatientVitals, registerPatient } from "./patient.controller.js";

const router = express.Router();

router.post("/", registerPatient);
router.get("/:id/vitals", authenticate, getPatientVitals);
router.get("/", getPatients);

export default router;
