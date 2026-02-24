import { successResponse } from "../../utils/apiResponse.js";
import * as userService from "./user.service.js";

export const getMe = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ status: "error", message: "Unauthorized" });

    const user = await userService.getUserById(userId);
    if (!user) return res.status(404).json({ status: "error", message: "User not found" });

    res.status(200).json(successResponse(userService.toSafeUser(user)));
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userIdParam = Number(req.params.id);
    const tokenUserId = Number(req.user?.id);
    if (Number.isNaN(userIdParam)) {
      return res.status(400).json({ status: "error", message: "Invalid user id" });
    }
    if (Number.isNaN(tokenUserId) || tokenUserId !== userIdParam) {
      return res.status(403).json({ status: "error", message: "Forbidden" });
    }

    const updatedUser = await userService.updateUserProfile(tokenUserId, req.body);
    res.status(200).json(successResponse(updatedUser));
  } catch (err) {
    next(err);
  }
};
