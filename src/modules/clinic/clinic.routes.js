import express from "express";
import authenticate from "../../middleware/authenticate.js";
import requireRole from "../../middleware/requireRole.js";
import { getClinics, getNearby, search } from "./clinic.controller.js";
import {
	getClinicHours,
	upsertClinicHours,
	deleteClinicHours,
} from "./clinicHours.controller.js";

const router = express.Router();

router.get("/", getClinics);
router.get("/nearby", getNearby);
router.get("/search", search);

router.get("/:id/hours", getClinicHours);
router.post(
	"/:id/hours",
	authenticate,
	requireRole("reception"),
	upsertClinicHours
);
router.delete(
	"/:id/hours/:day_of_week",
	authenticate,
	requireRole("reception"),
	deleteClinicHours
);

export default router;
