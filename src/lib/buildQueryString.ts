type SearchParamsInput = URLSearchParams | Record<string, string | string[] | undefined>;

// server-এ searchParams আসে object হিসেবে, client-এ URLSearchParams হিসেবে; দুটোকেই এক রূপে আনা
const toEntries = (input: SearchParamsInput): Array<[string, string]> => {
	if (input instanceof URLSearchParams) return [...input.entries()];

	return Object.entries(input).flatMap(([key, raw]) => {
		if (raw === undefined) return [];
		return (Array.isArray(raw) ? raw : [raw]).map((value): [string, string] => [key, value]);
	});
};

/**
 * শুধু allowlist-এর key backend-এ যায় (বাকি সব বাদ)।
 * default (যেমন page=1) বসানো থাকে, যাতে "/doctors" আর "/doctors?page=1" একই cache key পায়।
 */
export const buildQueryString = (
	input: SearchParamsInput,
	allowedKeys: ReadonlySet<string>,
	defaults: Record<string, string> = {},
): string => {
	const result = new URLSearchParams();

	for (const [key, value] of toEntries(input)) {
		const trimmed = value.trim();
		if (allowedKeys.has(key) && trimmed) result.append(key, trimmed);
	}

	for (const [key, value] of Object.entries(defaults)) {
		if (!result.has(key)) result.set(key, value);
	}

	return result.toString();
};
