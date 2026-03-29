import { successResponse } from "../../utils/apiResponse.js";
import { listDoctors, getDoctorById as getDoctorByIdService } from "./doctor.service.js";

export const getDoctors = async (_req, res, next) => {
  try {
    const doctors = await listDoctors();
    res.status(200).json(successResponse(doctors));
  } catch (error) {
    next(error);
  }
};

export const getDoctor = async (req, res, next) => {
  try {
    const doctor = await getDoctorByIdService(req.params.id);
    if (!doctor) {
      return res.status(404).json({ error: { message: "Doctor not found" } });
    }
    res.status(200).json(successResponse(doctor));
  } catch (error) {
    next(error);
  }
};

