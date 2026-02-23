import express from "express";
import {
  createAppointment,
  getAppointments,
  arriveAppointment,
  takeNextPatient,
  completeAppointment,
  getQueue,
  cancelExistingAppointment,
} from "./appointment.controller.js";

const router = express.Router();

router.get("/", getAppointments);
router.get("/queue/:doctorId", getQueue);
router.post("/", createAppointment);
router.put("/:id/arrive", arriveAppointment);
router.post("/:doctorId/next", takeNextPatient);
router.put("/:id/complete", completeAppointment);
router.put("/:id/cancel", cancelExistingAppointment);

export default router;
