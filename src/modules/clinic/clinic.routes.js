import express from "express";
import { getClinics, getNearby, search } from "./clinic.controller.js";

const router = express.Router();

router.get("/", getClinics);
router.get("/nearby", getNearby);
router.get("/search", search);

export default router;
