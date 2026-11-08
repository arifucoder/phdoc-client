"use client";

import DataTable from "@/components/shared/table/DataTable";
import DataTablePagination from "@/components/shared/table/DataTablePagination";
import DataTableDateRangeFilter from "@/components/shared/table/filters/DataTableDateRangeFilter";
import { Button } from "@/components/ui/button";
import { useRowAction } from "@/hooks/useRowAction";
import { useTableUrlState } from "@/hooks/useTableUrlState";
import { buildQueryString } from "@/lib/buildQueryString";
import { schedulesQueryOptions } from "@/queries/schedule.queries";
import type { ISchedule } from "@/types/schedule.types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useEffect } from "react";
import CreateScheduleDialog from "./CreateScheduleDialog";
import DeleteScheduleDialog from "./DeleteScheduleDialog";
import EditScheduleDialog from "./EditScheduleDialog";
import { scheduleColumns } from "./schedulesColumns";
import {
	END_DATE_KEY,
	SCHEDULE_FILTER_KEYS,
	SCHEDULE_TABLE_DEFAULTS,
	SCHEDULE_TABLE_QUERY_KEYS,
	START_DATE_KEY,
} from "./schedulesTable.config";
import ViewScheduleDialog from "./ViewScheduleDialog";

const getScheduleId = (schedule: ISchedule) => schedule.id;

export default function SchedulesTable() {
	const table = useTableUrlState({ defaultLimit: Number(SCHEDULE_TABLE_DEFAULTS.limit) });
	const rowAction = useRowAction<ISchedule>();

	// server page-এর একই নিয়ম → একই cache key, প্রথমবার আবার fetch হয় না
	const queryString = buildQueryString(table.searchParams, SCHEDULE_TABLE_QUERY_KEYS, SCHEDULE_TABLE_DEFAULTS);

	const {
		data: response,
		isPending,
		isFetching,
		isError,
	} = useQuery({
		...schedulesQueryOptions(queryString),
		placeholderData: keepPreviousData,
	});

	// শেষ page-এর শেষ slot delete হলে আগের page-এ ফেরা
	const meta = response?.meta;
	const { setPage } = table;
	useEffect(() => {
		if (meta && meta.totalPages > 0 && meta.page > meta.totalPages) setPage(meta.totalPages);
	}, [meta, setPage]);

	const hasActiveFilters = SCHEDULE_FILTER_KEYS.some((key) => table.searchParams.has(key));

	if (isError && !response) {
		return <p className="text-sm text-destructive">Failed to load schedules.</p>;
	}

	return (
		<div className="space-y-4">
			{/* Toolbar: date filter + create */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex flex-wrap items-center gap-2">
					<DataTableDateRangeFilter
						label="Date"
						from={table.getFilter(START_DATE_KEY)}
						to={table.getFilter(END_DATE_KEY)}
						onChange={({ from, to }) => table.setFilters({ [START_DATE_KEY]: from, [END_DATE_KEY]: to })}
					/>

					{hasActiveFilters && (
						<Button variant="ghost" onClick={() => table.clearParams(SCHEDULE_FILTER_KEYS)}>
							<X />
							Reset
						</Button>
					)}
				</div>

				<CreateScheduleDialog />
			</div>

			<DataTable
				data={response?.data ?? []}
				columns={scheduleColumns}
				getRowId={getScheduleId}
				isLoading={isPending}
				isFetching={isFetching}
				emptyMessage={hasActiveFilters ? "No schedules in this date range." : "No schedules yet."}
				sorting={{ state: table.sorting, onSortingChange: table.setSorting }}
				actions={rowAction.actions}
			/>

			<DataTablePagination meta={response?.meta} onPageChange={table.setPage} onLimitChange={table.setLimit} />

			<ViewScheduleDialog {...rowAction.dialogProps("view")} />
			<EditScheduleDialog {...rowAction.dialogProps("edit")} />
			<DeleteScheduleDialog {...rowAction.dialogProps("delete")} />
		</div>
	);
}
