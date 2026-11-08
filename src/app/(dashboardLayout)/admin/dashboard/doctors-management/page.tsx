import DoctorsTable from "@/components/modules/Admin/DoctorsManagement/DoctorsTable";
import {
	DOCTOR_TABLE_DEFAULTS,
	DOCTOR_TABLE_QUERY_KEYS,
} from "@/components/modules/Admin/DoctorsManagement/doctorsTable.config";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { buildQueryString } from "@/lib/buildQueryString";
import { getQueryClient } from "@/lib/getQueryClient";
import { doctorsQueryOptions } from "@/queries/doctor.queries";
import { specialtiesQueryOptions } from "@/queries/specialty.queries";
import { dehydrate, HydrationBoundary, noop } from "@tanstack/react-query";
import { Suspense } from "react";

type SearchParams = Record<string, string | string[] | undefined>;

async function DoctorsSection({ searchParams }: { searchParams: Promise<SearchParams> }) {
	const queryString = buildQueryString(await searchParams, DOCTOR_TABLE_QUERY_KEYS, DOCTOR_TABLE_DEFAULTS);
	const queryClient = getQueryClient();

	// দুটো একসাথে (teacher-এর code-এ একটার পর একটা await হচ্ছিল)
	await Promise.all([
		queryClient.query(doctorsQueryOptions(queryString)).catch(noop),
		queryClient.query(specialtiesQueryOptions()).catch(noop),
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<DoctorsTable />
		</HydrationBoundary>
	);
}

export default function DoctorsManagementPage({ searchParams }: PageProps<"/admin/dashboard/doctors-management">) {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Doctors Management</h1>
				<p className="text-sm text-muted-foreground">View, add, edit and remove doctors</p>
			</div>

			<Suspense fallback={<LoadingSpinner text="Loading doctors..." />}>
				<DoctorsSection searchParams={searchParams} />
			</Suspense>
		</div>
	);
}
