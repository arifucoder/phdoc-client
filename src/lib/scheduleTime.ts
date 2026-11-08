// backend schedule.constant.ts-এর সাথে মিল: clinic-এর সময় সবসময় ঢাকা (+06:00, DST নেই)
export const CLINIC_TIME_ZONE = "Asia/Dhaka";
export const SCHEDULE_INTERVAL_MINUTES = 30;

// locale + timeZone fixed: server (UTC) আর browser-এ একই output → hydration mismatch হয় না
const timeFormatter = new Intl.DateTimeFormat("en-US", {
	hour: "2-digit",
	minute: "2-digit",
	hour12: true,
	timeZone: CLINIC_TIME_ZONE,
});

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
	day: "2-digit",
	month: "short",
	year: "numeric",
	timeZone: CLINIC_TIME_ZONE,
});

// en-CA → "2026-11-08" format, input type="date"-এর সাথে মেলে
const partsFormatter = new Intl.DateTimeFormat("en-CA", {
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
	hour: "2-digit",
	minute: "2-digit",
	hourCycle: "h23",
	timeZone: CLINIC_TIME_ZONE,
});

const toValidDate = (value: string | null | undefined) => {
	if (!value) return null;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
};

export const formatClinicTime = (value: string | null | undefined) => {
	const date = toValidDate(value);
	return date ? timeFormatter.format(date) : "—";
};

export const formatClinicDateTime = (value: string | null | undefined) => {
	const date = toValidDate(value);
	return date ? `${dateFormatter.format(date)}, ${timeFormatter.format(date)}` : "—";
};

// ISO → { date: "2026-11-08", time: "09:30" } ঢাকার সময়ে (edit form-এর input-এর জন্য)
// teacher-এর date-fns format() browser-এর timezone নিত, ঢাকার বাইরে থাকলে ভুল সময় বসত
export const toClinicDateTimeParts = (value: string) => {
	const date = toValidDate(value);
	if (!date) return { date: "", time: "" };

	const parts = Object.fromEntries(partsFormatter.formatToParts(date).map(({ type, value: part }) => [type, part]));

	return {
		date: `${parts.year}-${parts.month}-${parts.day}`,
		time: `${parts.hour}:${parts.minute}`,
	};
};

export const getDurationMinutes = (start: string, end: string) => {
	const startDate = toValidDate(start);
	const endDate = toValidDate(end);
	if (!startDate || !endDate) return null;

	const minutes = Math.round((endDate.getTime() - startDate.getTime()) / 60_000);
	return minutes > 0 ? minutes : null;
};

// "09:30" → 570
export const timeToMinutes = (time: string) => {
	const [hours = 0, minutes = 0] = time.split(":").map(Number);
	return hours * 60 + minutes;
};
