import authRoutes from "./auth/auth.routes.js";
import clinicRoutes from "./clinic/clinic.routes.js";
import doctorRoutes from "./doctor/doctor.routes.js";
import patientRoutes from "./patient/patient.routes.js";
import appointmentRoutes from "./appointment/appointment.routes.js";

const registerModuleRoutes = (app) => {
  app.use("/auth", authRoutes);
  app.use("/clinics", clinicRoutes);
  app.use("/doctors", doctorRoutes);
  app.use("/patients", patientRoutes);
  app.use("/appointments", appointmentRoutes);
};

export default registerModuleRoutes;
