import SchedulesTable from "@/components/modules/Admin/SchedulesManagement/SchedulesTable";
import {
	SCHEDULE_TABLE_DEFAULTS,
	SCHEDULE_TABLE_QUERY_KEYS,
} from "@/components/modules/Admin/SchedulesManagement/schedulesTable.config";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { buildQueryString } from "@/lib/buildQueryString";
import { getQueryClient } from "@/lib/getQueryClient";
import { schedulesQueryOptions } from "@/queries/schedule.queries";
import { dehydrate, HydrationBoundary, noop } from "@tanstack/react-query";
import { Suspense } from "react";

type SearchParams = Record<string, string | string[] | undefined>;

async function SchedulesSection({ searchParams }: { searchParams: Promise<SearchParams> }) {
	const queryString = buildQueryString(await searchParams, SCHEDULE_TABLE_QUERY_KEYS, SCHEDULE_TABLE_DEFAULTS);
	const queryClient = getQueryClient();

	await queryClient.query(schedulesQueryOptions(queryString)).catch(noop);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<SchedulesTable />
		</HydrationBoundary>
	);
}

export default function SchedulesManagementPage({ searchParams }: PageProps<"/admin/dashboard/schedules-management">) {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Schedules Management</h1>
				<p className="text-sm text-muted-foreground">Create and manage 30-minute time slots doctors can pick</p>
			</div>

			<Suspense fallback={<LoadingSpinner text="Loading schedules..." />}>
				<SchedulesSection searchParams={searchParams} />
			</Suspense>
		</div>
	);
}
