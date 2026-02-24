import express from "express";
import authenticate from "../../middleware/authenticate.js";
import {
  listNotifications,
  markNotificationAsRead,
  markAllNotificationsRead,
} from "./notification.controller.js";

const router = express.Router();

router.get("/", authenticate, listNotifications);
router.put("/:id/read", authenticate, markNotificationAsRead);
router.put("/mark-all-read", authenticate, markAllNotificationsRead);

export default router;