import { SCHEDULE_INTERVAL_MINUTES, timeToMinutes } from "@/lib/scheduleTime";
import * as z from "zod";

// backend schedule.validation.ts-এর একই নিয়ম।
// input type="date" → "YYYY-MM-DD", type="time" → "HH:mm": form-এর মান আর payload একই string,
// তাই doctor-এর মতো আলাদা form/server schema লাগে না, একই schema দুই জায়গায় চলে।

const dateField = (label: string) =>
	z
		.string()
		.min(1, `${label} is required`)
		.pipe(z.iso.date(`${label} is invalid`));

const timeField = (label: string) =>
	z
		.string()
		.min(1, `${label} is required`)
		.pipe(z.iso.time({ precision: -1, error: `${label} must be in HH:mm format` }));

const scheduleShape = z.object({
	startDate: dateField("Start date"),
	endDate: dateField("End date"),
	startTime: timeField("Start time"),
	endTime: timeField("End time"),
});

// Create: date range × প্রতিদিনের time window → অনেকগুলো slot
export const createScheduleSchema = scheduleShape
	.refine((data) => data.endDate >= data.startDate, {
		message: "End date can't be before start date",
		path: ["endDate"],
	})
	// backend: একটাও slot না হলে 400 দেয়, তাই এখানেই আটকাই
	.refine((data) => timeToMinutes(data.endTime) - timeToMinutes(data.startTime) >= SCHEDULE_INTERVAL_MINUTES, {
		message: `End time must be at least ${SCHEDULE_INTERVAL_MINUTES} minutes after start time`,
		path: ["endTime"],
	});

// Update: একটা slot-এর নতুন শুরু আর শেষ
export const updateScheduleSchema = scheduleShape.refine(
	(data) => `${data.endDate}T${data.endTime}` > `${data.startDate}T${data.startTime}`,
	{ message: "End must be after start", path: ["endTime"] },
);

export type ScheduleFormValues = z.input<typeof createScheduleSchema>;
