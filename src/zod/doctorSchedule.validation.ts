import * as z from "zod";

// server action-এ ব্যবহার হয় (form নেই, doctor button চেপে slot বাছে)
export const createDoctorSchedulePayloadSchema = z.object({
	scheduleIds: z
		.array(z.uuid("Invalid schedule id"))
		.min(1, "Select at least one slot")
		.max(100, "You can add at most 100 slots at once"),
});
