import { successResponse } from "../../utils/apiResponse.js";
import {
  listNotificationsForUser,
  markNotificationRead,
  markAllNotificationsReadForUser,
  parseUnreadOnlyFlag,
} from "./notification.service.js";

const ensureUser = (req) => {
  const userId = req.user?.id;
  if (!userId) {
    throw Object.assign(new Error("Unauthorized"), { status: 401 });
  }
  return userId;
};

export const listNotifications = async (req, res, next) => {
  try {
    const userId = ensureUser(req);
    const unreadOnly = parseUnreadOnlyFlag(req.query.unreadOnly);

    const notifications = await listNotificationsForUser({ userId, unreadOnly });
    res.status(200).json(successResponse(notifications));
  } catch (error) {
    next(error);
  }
};

export const markNotificationAsRead = async (req, res, next) => {
  try {
    const userId = ensureUser(req);
    const notification = await markNotificationRead({ userId, notificationId: req.params.id });
    res.status(200).json(successResponse(notification));
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    const userId = ensureUser(req);
    const updatedCount = await markAllNotificationsReadForUser({ userId });
    res.status(200).json(successResponse({ updated: updatedCount }));
  } catch (error) {
    next(error);
  }
};