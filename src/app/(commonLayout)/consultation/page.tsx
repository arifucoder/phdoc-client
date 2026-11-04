import DoctorsList from "@/components/modules/Consultation/DoctorsList";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { getQueryClient } from "@/lib/getQueryClient";
import { doctorsQueryOptions } from "@/queries/doctor.queries";
import { specialtiesQueryOptions } from "@/queries/specialty.queries";
import { dehydrate, HydrationBoundary, noop } from "@tanstack/react-query";
import { Suspense } from "react";

const DEFAULT_PAGE = "1";
const DEFAULT_LIMIT = "12";

const ALLOWED_QUERY_KEYS = new Set(["page", "limit", "sortBy", "sortOrder", "searchTerm"]);

type SearchParams = Record<string, string | string[] | undefined>;

function buildQueryString(params: SearchParams) {
	const result = new URLSearchParams();

	for (const [key, raw] of Object.entries(params)) {
		if (!ALLOWED_QUERY_KEYS.has(key) || raw === undefined) continue;

		const values = Array.isArray(raw) ? raw : [raw];
		for (const value of values) {
			const trimmed = value.trim();
			if (trimmed) result.append(key, trimmed);
		}
	}

	// URL-এ না থাকলে default বসাও, যাতে cache key সবসময় একই থাকে
	if (!result.has("page")) result.set("page", DEFAULT_PAGE);
	if (!result.has("limit")) result.set("limit", DEFAULT_LIMIT);

	return result.toString();
}

async function DoctorsSection({ searchParams }: { searchParams: Promise<SearchParams> }) {
	const queryString = buildQueryString(await searchParams);
	const queryClient = getQueryClient();

	await Promise.all([
		queryClient.query(doctorsQueryOptions(queryString)).catch(noop),
		queryClient.query(specialtiesQueryOptions()).catch(noop),
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<DoctorsList queryString={queryString} />
		</HydrationBoundary>
	);
}

export default function ConsultationPage({ searchParams }: PageProps<"/consultation">) {
	return (
		<Suspense fallback={<LoadingSpinner text="Loading doctors..." />}>
			<DoctorsSection searchParams={searchParams} />
		</Suspense>
	);
}
