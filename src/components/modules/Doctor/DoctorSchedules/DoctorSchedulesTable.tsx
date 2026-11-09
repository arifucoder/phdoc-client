"use client";

import DataTable from "@/components/shared/table/DataTable";
import DataTablePagination from "@/components/shared/table/DataTablePagination";
import DataTableDateRangeFilter from "@/components/shared/table/filters/DataTableDateRangeFilter";
import DataTableSelectFilter from "@/components/shared/table/filters/DataTableSelectFilter";
import { Button } from "@/components/ui/button";
import { useRowAction } from "@/hooks/useRowAction";
import { useTableUrlState } from "@/hooks/useTableUrlState";
import { myDoctorSchedulesQueryOptions } from "@/queries/doctorSchedule.queries";
import type { IDoctorSchedule } from "@/types/doctorSchedule.types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useEffect, useMemo } from "react";
import AddSchedulesDialog from "./AddSchedulesDialog";
import { doctorScheduleColumns } from "./doctorSchedulesColumns";
import {
	BOOKED_KEY,
	buildMyScheduleQueryString,
	FROM_KEY,
	MY_SCHEDULE_FILTER_KEYS,
	MY_SCHEDULE_TABLE_DEFAULTS,
	STATUS_OPTIONS,
	TO_KEY,
} from "./doctorSchedulesTable.config";
import RemoveScheduleDialog from "./RemoveScheduleDialog";

// নিজের list-এ scheduleId-ই unique (doctorId সবার একই)
const getRowId = (item: IDoctorSchedule) => item.scheduleId;

export default function DoctorSchedulesTable() {
	const table = useTableUrlState({ defaultLimit: Number(MY_SCHEDULE_TABLE_DEFAULTS.limit) });
	const rowAction = useRowAction<IDoctorSchedule>();

	const queryString = buildMyScheduleQueryString(table.searchParams);

	const {
		data: response,
		isPending,
		isFetching,
		isError,
	} = useQuery({
		...myDoctorSchedulesQueryOptions(queryString),
		placeholderData: keepPreviousData,
	});

	const meta = response?.meta;
	const { setPage } = table;
	useEffect(() => {
		if (meta && meta.totalPages > 0 && meta.page > meta.totalPages) setPage(meta.totalPages);
	}, [meta, setPage]);

	// এখানে edit করার কিছু নেই, শুধু remove। DataTable শুধু দেওয়া action-ই দেখায়।
	const actions = useMemo(() => ({ onDelete: rowAction.actions.onDelete }), [rowAction.actions]);

	const hasActiveFilters = MY_SCHEDULE_FILTER_KEYS.some((key) => table.searchParams.has(key));

	if (isError && !response) {
		return <p className="text-sm text-destructive">Failed to load your schedules.</p>;
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex flex-wrap items-center gap-2">
					<DataTableSelectFilter
						label="Status"
						allLabel="All slots"
						value={table.getFilter(BOOKED_KEY)}
						options={STATUS_OPTIONS}
						onChange={(value) => table.setFilters({ [BOOKED_KEY]: value })}
					/>

					<DataTableDateRangeFilter
						label="Date"
						from={table.getFilter(FROM_KEY)}
						to={table.getFilter(TO_KEY)}
						onChange={({ from, to }) => table.setFilters({ [FROM_KEY]: from, [TO_KEY]: to })}
					/>

					{hasActiveFilters && (
						<Button variant="ghost" onClick={() => table.clearParams(MY_SCHEDULE_FILTER_KEYS)}>
							<X />
							Reset
						</Button>
					)}
				</div>

				<AddSchedulesDialog />
			</div>

			<DataTable
				data={response?.data ?? []}
				columns={doctorScheduleColumns}
				getRowId={getRowId}
				isLoading={isPending}
				isFetching={isFetching}
				emptyMessage={hasActiveFilters ? "No slots match these filters." : "You haven't added any slots yet."}
				sorting={{ state: table.sorting, onSortingChange: table.setSorting }}
				actions={actions}
			/>

			<DataTablePagination meta={response?.meta} onPageChange={table.setPage} onLimitChange={table.setLimit} />

			<RemoveScheduleDialog {...rowAction.dialogProps("delete")} />
		</div>
	);
}
