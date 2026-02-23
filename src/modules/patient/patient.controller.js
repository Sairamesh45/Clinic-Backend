import { successResponse } from "../../utils/apiResponse.js";
import { listPatients } from "./patient.service.js";

export const getPatients = async (_req, res, next) => {
  try {
    const patients = await listPatients();
    res.status(200).json(successResponse(patients));
  } catch (error) {
    next(error);
  }
};
