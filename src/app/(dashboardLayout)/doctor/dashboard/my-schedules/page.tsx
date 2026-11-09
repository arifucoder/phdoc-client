import DoctorSchedulesTable from "@/components/modules/Doctor/DoctorSchedules/DoctorSchedulesTable";
import { buildMyScheduleQueryString } from "@/components/modules/Doctor/DoctorSchedules/doctorSchedulesTable.config";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { getQueryClient } from "@/lib/getQueryClient";
import { myDoctorSchedulesQueryOptions } from "@/queries/doctorSchedule.queries";
import { dehydrate, HydrationBoundary, noop } from "@tanstack/react-query";
import { Suspense } from "react";

type SearchParams = Record<string, string | string[] | undefined>;

async function MySchedulesSection({ searchParams }: { searchParams: Promise<SearchParams> }) {
	const queryString = buildMyScheduleQueryString(await searchParams);
	const queryClient = getQueryClient();

	await queryClient.query(myDoctorSchedulesQueryOptions(queryString)).catch(noop);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<DoctorSchedulesTable />
		</HydrationBoundary>
	);
}

export default function MySchedulesPage({ searchParams }: PageProps<"/doctor/dashboard/my-schedules">) {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">My Schedules</h1>
				<p className="text-sm text-muted-foreground">Choose when patients can book you, and manage your slots</p>
			</div>

			<Suspense fallback={<LoadingSpinner text="Loading your schedules..." />}>
				<MySchedulesSection searchParams={searchParams} />
			</Suspense>
		</div>
	);
}
