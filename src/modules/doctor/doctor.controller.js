import { successResponse } from "../../utils/apiResponse.js";
import { listDoctors } from "./doctor.service.js";

export const getDoctors = async (_req, res, next) => {
  try {
    const doctors = await listDoctors();
    res.status(200).json(successResponse(doctors));
  } catch (error) {
    next(error);
  }
};
