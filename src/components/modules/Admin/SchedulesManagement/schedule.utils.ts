import { SCHEDULE_INTERVAL_MINUTES, timeToMinutes, toClinicDateTimeParts } from "@/lib/scheduleTime";
import type { ISchedule } from "@/types/schedule.types";
import { createScheduleSchema, type ScheduleFormValues } from "@/zod/schedule.validation";

export const EMPTY_SCHEDULE_FORM: ScheduleFormValues = {
	startDate: "",
	endDate: "",
	startTime: "",
	endTime: "",
};

export const scheduleToFormValues = (schedule: ISchedule): ScheduleFormValues => {
	const start = toClinicDateTimeParts(schedule.startDateTime);
	const end = toClinicDateTimeParts(schedule.endDateTime);

	return { startDate: start.date, startTime: start.time, endDate: end.date, endTime: end.time };
};

export const isSameFormValues = (a: ScheduleFormValues, b: ScheduleFormValues) =>
	(Object.keys(a) as Array<keyof ScheduleFormValues>).every((key) => a[key] === b[key]);

export const getBookedCount = (schedule: ISchedule) =>
	schedule.doctorSchedules?.filter((link) => link.isBooked).length ?? 0;

// booked slot-এ appointment আছে → backend update/delete 409 দেয়। আগেই UI-তে জানিয়ে দিই।
export const isScheduleLocked = (schedule: ISchedule) => getBookedCount(schedule) > 0;

// backend-এর loop-এর একই হিসাব: দিন × প্রতিদিনের slot
export const countSlots = (values: ScheduleFormValues) => {
	const parsed = createScheduleSchema.safeParse(values);
	if (!parsed.success) return 0;

	const { startDate, endDate, startTime, endTime } = parsed.data;
	const days = Math.round((Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / 86_400_000) + 1;
	const slotsPerDay = Math.floor((timeToMinutes(endTime) - timeToMinutes(startTime)) / SCHEDULE_INTERVAL_MINUTES);

	return days * slotsPerDay;
};
