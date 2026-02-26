-- Create table for doctor availability blocks
CREATE TABLE "doctor_availability" (
  "id" SERIAL PRIMARY KEY,
  "doctor_id" INTEGER NOT NULL,
  "clinic_id" INTEGER NOT NULL,
  "day_of_week" INTEGER NOT NULL CHECK ("day_of_week" >= 0 AND "day_of_week" <= 6),
  "start_time" TIME,
  "end_time" TIME,
  CONSTRAINT "doctor_availability_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id"),
  CONSTRAINT "doctor_availability_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "Clinic"("id")
);

CREATE INDEX "idx_doctor_availability_doctor_id" ON "doctor_availability" ("doctor_id");
CREATE INDEX "idx_doctor_availability_clinic_id" ON "doctor_availability" ("clinic_id");
