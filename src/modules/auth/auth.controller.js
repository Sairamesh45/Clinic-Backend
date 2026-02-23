import { successResponse } from "../../utils/apiResponse.js";
import { authenticate } from "./auth.service.js";

export const login = async (req, res, next) => {
  try {
    const authResult = await authenticate(req.body);
    res.status(200).json(successResponse(authResult));
  } catch (error) {
    next(error);
  }
};
