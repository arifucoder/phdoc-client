import { buildQueryString } from "@/lib/buildQueryString";
import { addDaysToDateString, clinicDayStartIso } from "@/lib/scheduleTime";

export const MY_SCHEDULE_TABLE_DEFAULTS = { page: "1", limit: "10" } as const;

export const BOOKED_KEY = "isBooked";
export const FROM_KEY = "from";
export const TO_KEY = "to";

// "Reset" চাপলে এগুলো মুছবে
export const MY_SCHEDULE_FILTER_KEYS = [BOOKED_KEY, FROM_KEY, TO_KEY] as const;

// এগুলো URL থেকে সরাসরি backend-এ যায়
// (backend sortable: createdAt, schedule.startDateTime, schedule.endDateTime)
const PASS_THROUGH_KEYS: ReadonlySet<string> = new Set(["page", "limit", "sortBy", "sortOrder", BOOKED_KEY]);

// backend QueryBuilder "true"/"false" string-কে boolean বানায়
export const STATUS_OPTIONS = [
	{ label: "Available", value: "false" },
	{ label: "Booked", value: "true" },
];

type SearchParamsInput = URLSearchParams | Record<string, string | string[] | undefined>;

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const readDateParam = (input: SearchParamsInput, key: string) => {
	const raw = input instanceof URLSearchParams ? input.get(key) : input[key];
	const value = Array.isArray(raw) ? raw[0] : raw;
	return value && ISO_DATE_REGEX.test(value) ? value : undefined;
};

/**
 * URL-এ সুন্দর ?from=2026-11-08&to=2026-11-10 থাকে,
 * backend-এ যায় schedule.startDateTime[gte]/[lt] = ঢাকার দিনের শুরু (ISO)।
 * server page আর client table দুজনেই এটা ডাকে → একই cache key।
 */
export const buildMyScheduleQueryString = (input: SearchParamsInput) => {
	const params = new URLSearchParams(buildQueryString(input, PASS_THROUGH_KEYS, MY_SCHEDULE_TABLE_DEFAULTS));

	const from = readDateParam(input, FROM_KEY);
	const to = readDateParam(input, TO_KEY);

	if (from) params.set("schedule.startDateTime[gte]", clinicDayStartIso(from));
	// "to" দিনটাও ধরা হবে → পরের দিনের রাত 12টার আগে পর্যন্ত
	if (to) params.set("schedule.startDateTime[lt]", clinicDayStartIso(addDaysToDateString(to, 1)));

	return params.toString();
};
