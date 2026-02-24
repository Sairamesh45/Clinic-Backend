import express from "express";
import authenticate from "../../middleware/authenticate.js";
import { getMe, updateProfile } from "./user.controller.js";

const router = express.Router();

router.get("/me", authenticate, getMe);
router.patch("/:id", authenticate, updateProfile);

export default router;
