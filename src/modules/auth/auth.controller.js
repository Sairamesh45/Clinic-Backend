import { successResponse } from "../../utils/apiResponse.js";
import { login as loginUser, register as registerUser } from "./auth.service.js";

export const login = async (req, res, next) => {
  try {
    const authResult = await loginUser(req.body);
    res.status(200).json(successResponse(authResult));
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json(successResponse(user));
  } catch (error) {
    next(error);
  }
};
