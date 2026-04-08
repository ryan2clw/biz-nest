-- Add new columns
ALTER TABLE "Appointment"
ADD COLUMN "scheduledStart" TIMESTAMP(3),
ADD COLUMN "scheduledEnd" TIMESTAMP(3);

-- Backfill from existing scheduler data
UPDATE "Appointment"
SET
  "scheduledStart" = "scheduledFor",
  "scheduledEnd" = "scheduledFor" + (COALESCE("durationMinutes", 120) * INTERVAL '1 minute');

-- Enforce required fields
ALTER TABLE "Appointment"
ALTER COLUMN "scheduledStart" SET NOT NULL,
ALTER COLUMN "scheduledEnd" SET NOT NULL;

-- Replace indexes
DROP INDEX IF EXISTS "Appointment_businessId_scheduledFor_idx";
DROP INDEX IF EXISTS "Appointment_technicianId_scheduledFor_idx";

CREATE INDEX "Appointment_businessId_scheduledStart_idx" ON "Appointment"("businessId", "scheduledStart");
CREATE INDEX "Appointment_technicianId_scheduledStart_idx" ON "Appointment"("technicianId", "scheduledStart");

-- Remove old columns
ALTER TABLE "Appointment"
DROP COLUMN "scheduledFor",
DROP COLUMN "durationMinutes";
