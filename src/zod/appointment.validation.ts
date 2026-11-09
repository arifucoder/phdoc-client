import * as z from "zod";

// backend bookAppointmentValidationSchema-র সাথে মিল
export const bookAppointmentPayloadSchema = z.object({
	doctorId: z.uuid("Invalid doctor"),
	scheduleId: z.uuid("Select a time slot"),
});

export const paymentModeSchema = z.enum(["pay-now", "pay-later"], "Invalid payment option");
