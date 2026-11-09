import { CONSULTATION_DEFAULTS, CONSULTATION_QUERY_KEYS } from "@/components/modules/Consultation/consultation.config";
import DoctorsList from "@/components/modules/Consultation/DoctorsList";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { buildQueryString } from "@/lib/buildQueryString";
import { getQueryClient } from "@/lib/getQueryClient";
import { doctorsQueryOptions } from "@/queries/doctor.queries";
import { specialtiesQueryOptions } from "@/queries/specialty.queries";
import { dehydrate, HydrationBoundary, noop } from "@tanstack/react-query";
import { Suspense } from "react";

type SearchParams = Record<string, string | string[] | undefined>;

// server শুধু প্রথমবার data আনে (loading ছাড়া প্রথম render)।
// এরপর filter বদলালে client-এর useQuery নিজেই আনে, server আবার চলে না।
async function DoctorsSection({ searchParams }: { searchParams: Promise<SearchParams> }) {
	const queryString = buildQueryString(await searchParams, CONSULTATION_QUERY_KEYS, CONSULTATION_DEFAULTS);
	const queryClient = getQueryClient();

	await Promise.all([
		queryClient.query(doctorsQueryOptions(queryString)).catch(noop),
		queryClient.query(specialtiesQueryOptions()).catch(noop),
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<DoctorsList />
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
