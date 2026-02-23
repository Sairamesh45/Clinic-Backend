import { successResponse } from "../../utils/apiResponse.js";
import { listClinics } from "./clinic.service.js";

export const getClinics = async (_req, res, next) => {
  try {
    const clinics = await listClinics();
    res.status(200).json(successResponse(clinics));
  } catch (error) {
    next(error);
  }
};
