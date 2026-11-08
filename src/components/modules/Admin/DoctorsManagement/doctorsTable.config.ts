// admin doctor table-এর URL param নিয়ম এক জায়গায়: page (server) আর table (client) দুজনেই ব্যবহার করে
export const DOCTOR_TABLE_DEFAULTS = { page: "1", limit: "10" } as const;

export const SPECIALTY_FILTER_KEY = "specialties.specialty.title";
export const FEE_MIN_KEY = "appointmentFee[gte]";
export const FEE_MAX_KEY = "appointmentFee[lte]";

// "Reset" চাপলে এগুলো মুছবে (page, limit, sort থাকবে)
export const DOCTOR_FILTER_KEYS = ["searchTerm", "gender", SPECIALTY_FILTER_KEY, FEE_MIN_KEY, FEE_MAX_KEY] as const;

// backend doctor.constant.ts-এর searchable/filterable/sortable field অনুযায়ী
export const DOCTOR_TABLE_QUERY_KEYS: ReadonlySet<string> = new Set([
	"page",
	"limit",
	"sortBy",
	"sortOrder",
	...DOCTOR_FILTER_KEYS,
]);

// backend-এ OTHER নেই
export const GENDER_OPTIONS = [
	{ label: "Male", value: "MALE" },
	{ label: "Female", value: "FEMALE" },
];

export const GENDER_LABELS: Record<string, string> = Object.fromEntries(
	GENDER_OPTIONS.map((option) => [option.value, option.label]),
);
