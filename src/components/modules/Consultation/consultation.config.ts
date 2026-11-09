import {
	DOCTOR_FILTER_KEYS,
	FEE_MAX_KEY,
	FEE_MIN_KEY,
	GENDER_OPTIONS,
	SPECIALTY_FILTER_KEY,
} from "@/components/modules/Admin/DoctorsManagement/doctorsTable.config";

// filter-এর নিয়ম admin doctor table-এর সাথে এক: একই backend endpoint (/doctors)
export { FEE_MAX_KEY, FEE_MIN_KEY, GENDER_OPTIONS, SPECIALTY_FILTER_KEY };

export const CONSULTATION_DEFAULTS = { page: "1", limit: "12" } as const; // 3-column grid → 12

export const CONSULTATION_FILTER_KEYS = DOCTOR_FILTER_KEYS;

// page (server) আর DoctorsList (client) দুজনেই এটা দিয়ে query string বানায় → একই cache key
export const CONSULTATION_QUERY_KEYS: ReadonlySet<string> = new Set([
	"page",
	"limit",
	"sortBy",
	"sortOrder",
	...CONSULTATION_FILTER_KEYS,
]);

// "field:order": একটা dropdown-এ দুটো মান (backend doctorSortableFields অনুযায়ী)
export const SORT_OPTIONS = [
	{ label: "Fee: low to high", value: "appointmentFee:asc" },
	{ label: "Fee: high to low", value: "appointmentFee:desc" },
	{ label: "Most experienced", value: "experience:desc" },
	{ label: "Top rated", value: "averageRating:desc" },
	{ label: "Name: A–Z", value: "name:asc" },
];
