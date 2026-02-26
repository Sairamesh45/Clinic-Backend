import DoctorAvailabilityModel from "../../models/doctorAvailability.model.js";

export const listAvailabilityForDoctor = (doctorId) =>
  DoctorAvailabilityModel.listForDoctor(doctorId);

export const createAvailabilityBlock = (doctorId, data) =>
  DoctorAvailabilityModel.createBlock({ doctorId, ...data });

export const findAvailability = (availabilityId) =>
  DoctorAvailabilityModel.findById(availabilityId);

export const updateAvailabilityBlock = (availabilityId, data) =>
  DoctorAvailabilityModel.updateBlock(availabilityId, data);

export const deleteAvailabilityBlock = (availabilityId) =>
  DoctorAvailabilityModel.deleteBlock(availabilityId);
