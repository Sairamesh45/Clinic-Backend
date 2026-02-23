import express from "express";
import { getPatients } from "./patient.controller.js";

const router = express.Router();

router.get("/", getPatients);

export default router;
