import { successResponse } from "../../utils/apiResponse.js";
import { listClinics, getNearByClinics, searchClinics } from "./clinic.service.js";

export const getClinics = async (_req, res, next) => {
  try {
    const clinics = await listClinics();
    res.status(200).json(successResponse(clinics));
  } catch (error) {
    next(error);
  }
};

export const getNearby = async (req, res, next) => {
  try {
    const { lat, lng, radius = 50 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const searchRadius = parseFloat(radius);

    if (isNaN(userLat) || isNaN(userLng) || isNaN(searchRadius)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates or radius",
      });
    }

    const clinics = await getNearByClinics(userLat, userLng, searchRadius);
    res.status(200).json(successResponse(clinics));
  } catch (error) {
    next(error);
  }
};

export const search = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const clinics = await searchClinics(q.trim());
    res.status(200).json(successResponse(clinics));
  } catch (error) {
    next(error);
  }
};
