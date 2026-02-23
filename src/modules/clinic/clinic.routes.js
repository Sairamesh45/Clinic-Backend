import express from "express";
import { getClinics } from "./clinic.controller.js";

const router = express.Router();

router.get("/", getClinics);

export default router;
