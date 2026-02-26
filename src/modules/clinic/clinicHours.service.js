import ClinicHoursModel from "../../models/clinicHours.model.js";

export const listHoursForClinic = (clinicId) => ClinicHoursModel.listForClinic(clinicId);

export const upsertClinicHour = (clinicId, dayOfWeek, data) =>
  ClinicHoursModel.upsertDay({ clinicId, dayOfWeek, ...data });

export const deleteClinicHour = (clinicId, dayOfWeek) =>
  ClinicHoursModel.deleteDay(clinicId, dayOfWeek);
