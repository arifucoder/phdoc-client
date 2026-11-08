import DoctorsList from "@/components/modules/Consultation/DoctorsList";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { buildQueryString } from "@/lib/buildQueryString";
import { getQueryClient } from "@/lib/getQueryClient";
import { doctorsQueryOptions } from "@/queries/doctor.queries";
import { specialtiesQueryOptions } from "@/queries/specialty.queries";
import { dehydrate, HydrationBoundary, noop } from "@tanstack/react-query";
import { Suspense } from "react";

// public consultation page-এ শুধু এগুলো চলবে
const ALLOWED_QUERY_KEYS: ReadonlySet<string> = new Set(["page", "limit", "sortBy", "sortOrder", "searchTerm"]);
const DEFAULTS = { page: "1", limit: "12" };

type SearchParams = Record<string, string | string[] | undefined>;

async function DoctorsSection({ searchParams }: { searchParams: Promise<SearchParams> }) {
	const queryString = buildQueryString(await searchParams, ALLOWED_QUERY_KEYS, DEFAULTS);
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
