import express from "express";
import authenticate from "../../middleware/authenticate.js";
import requireRole from "../../middleware/requireRole.js";
import { getDoctors } from "./doctor.controller.js";
import {
	getDoctorAvailability,
	createDoctorAvailability,
	updateDoctorAvailability,
	deleteDoctorAvailability,
} from "./doctorAvailability.controller.js";

const router = express.Router();

router.get("/", getDoctors);
router.get("/:id/availability", getDoctorAvailability);

router.post(
	"/:id/availability",
	authenticate,
	requireRole("doctor"),
	createDoctorAvailability
);
router.put(
	"/:id/availability/:availabilityId",
	authenticate,
	requireRole("doctor"),
	updateDoctorAvailability
);
router.delete(
	"/:id/availability/:availabilityId",
	authenticate,
	requireRole("doctor"),
	deleteDoctorAvailability
);

export default router;
