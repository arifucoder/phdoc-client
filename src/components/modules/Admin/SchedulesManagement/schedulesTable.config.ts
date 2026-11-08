// admin schedule table-এর URL param নিয়ম: page (server) আর table (client) দুজনেই ব্যবহার করে

// include: backend default-এ কোনো relation দেয় না, তাই doctorSchedules চেয়ে নিই।
// "include" allowlist-এ নেই → URL দিয়ে বদলানো যায় না, কিন্তু default হিসেবে সবসময় যায়
export const SCHEDULE_TABLE_DEFAULTS = { page: "1", limit: "10", include: "doctorSchedules" } as const;

export const START_DATE_KEY = "startDate";
export const END_DATE_KEY = "endDate";

// backend-এ searchableFields নেই, তাই search box নেই। date range দিয়ে filter হয়।
export const SCHEDULE_FILTER_KEYS = [START_DATE_KEY, END_DATE_KEY] as const;

// backend scheduleSortableFields: startDateTime, endDateTime, createdAt
export const SCHEDULE_TABLE_QUERY_KEYS: ReadonlySet<string> = new Set([
	"page",
	"limit",
	"sortBy",
	"sortOrder",
	...SCHEDULE_FILTER_KEYS,
]);
