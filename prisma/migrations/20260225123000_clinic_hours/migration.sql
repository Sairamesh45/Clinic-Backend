-- Create time slots for clinic working days
CREATE TABLE "clinic_hours" (
  "id" SERIAL PRIMARY KEY,
  "clinic_id" INTEGER NOT NULL,
  "day_of_week" INTEGER NOT NULL CHECK ("day_of_week" >= 0 AND "day_of_week" <= 6),
  "open_time" TIME,
  "close_time" TIME,
  "is_closed" BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT "clinic_hours_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "Clinic"("id"),
  CONSTRAINT "clinic_hours_clinic_id_day_of_week_key" UNIQUE ("clinic_id", "day_of_week")
);
