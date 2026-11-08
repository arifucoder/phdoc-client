"use client";

import DataTable from "@/components/shared/table/DataTable";
import DataTablePagination from "@/components/shared/table/DataTablePagination";
import DataTableSearch from "@/components/shared/table/DataTableSearch";
import DataTableMultiSelectFilter from "@/components/shared/table/filters/DataTableMultiSelectFilter";
import DataTableRangeFilter from "@/components/shared/table/filters/DataTableRangeFilter";
import DataTableSelectFilter from "@/components/shared/table/filters/DataTableSelectFilter";
import { Button } from "@/components/ui/button";
import { useRowAction } from "@/hooks/useRowAction";
import { useTableUrlState } from "@/hooks/useTableUrlState";
import { buildQueryString } from "@/lib/buildQueryString";
import { doctorsQueryOptions } from "@/queries/doctor.queries";
import { specialtiesQueryOptions } from "@/queries/specialty.queries";
import type { IDoctor } from "@/types/doctor.types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useEffect, useMemo } from "react";
import CreateDoctorDialog from "./CreateDoctorDialog";
import DeleteDoctorDialog from "./DeleteDoctorDialog";
import { doctorColumns } from "./doctorsColumns";
import {
	DOCTOR_FILTER_KEYS,
	DOCTOR_TABLE_DEFAULTS,
	DOCTOR_TABLE_QUERY_KEYS,
	FEE_MAX_KEY,
	FEE_MIN_KEY,
	GENDER_OPTIONS,
	SPECIALTY_FILTER_KEY,
} from "./doctorsTable.config";
import EditDoctorDialog from "./EditDoctorDialog";
import ViewDoctorDialog from "./ViewDoctorDialog";

// component-এর বাইরে: প্রতি render-এ নতুন function তৈরি হয় না
const getDoctorId = (doctor: IDoctor) => doctor.id;

export default function DoctorsTable() {
	const table = useTableUrlState({ defaultLimit: Number(DOCTOR_TABLE_DEFAULTS.limit) });
	const rowAction = useRowAction<IDoctor>();

	// server page-এর মতো একই নিয়ম → একই cache key, প্রথমবার আবার fetch হয় না
	const queryString = buildQueryString(table.searchParams, DOCTOR_TABLE_QUERY_KEYS, DOCTOR_TABLE_DEFAULTS);

	const {
		data: response,
		isPending,
		isFetching,
		isError,
	} = useQuery({
		...doctorsQueryOptions(queryString),
		placeholderData: keepPreviousData, // নতুন data আসা পর্যন্ত পুরনোটা দেখায়
	});

	const { data: specialtiesResponse } = useQuery(specialtiesQueryOptions());

	// filter-এ title দিয়ে খোঁজা হয় (backend specialties.specialty.title)
	const specialtyOptions = useMemo(
		() => (specialtiesResponse?.data ?? []).map((specialty) => ({ label: specialty.title, value: specialty.title })),
		[specialtiesResponse],
	);

	// শেষ page-এর শেষ doctor delete হলে ফাঁকা page-এ আটকে না থেকে আগের page-এ যাওয়া
	const meta = response?.meta;
	const { setPage } = table;
	useEffect(() => {
		if (meta && meta.totalPages > 0 && meta.page > meta.totalPages) setPage(meta.totalPages);
	}, [meta, setPage]);

	const hasActiveFilters = DOCTOR_FILTER_KEYS.some((key) => table.searchParams.has(key));

	if (isError && !response) {
		return <p className="text-sm text-destructive">Failed to load doctors.</p>;
	}

	return (
		<div className="space-y-4">
			{/* Toolbar: search + filters + add */}
			<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
				<DataTableSearch
					value={table.searchTerm}
					onChange={table.setSearchTerm}
					placeholder="Search name, email, specialty..."
				/>

				<div className="flex flex-wrap items-center gap-2">
					<DataTableSelectFilter
						label="Gender"
						allLabel="All genders"
						value={table.getFilter("gender")}
						options={GENDER_OPTIONS}
						onChange={(value) => table.setFilters({ gender: value })}
					/>

					<DataTableMultiSelectFilter
						label="Specialties"
						values={table.getFilterList(SPECIALTY_FILTER_KEY)}
						options={specialtyOptions}
						onChange={(values) => table.setFilters({ [SPECIALTY_FILTER_KEY]: values })}
					/>

					<DataTableRangeFilter
						label="Fee"
						min={table.getFilter(FEE_MIN_KEY)}
						max={table.getFilter(FEE_MAX_KEY)}
						onChange={({ min, max }) => table.setFilters({ [FEE_MIN_KEY]: min, [FEE_MAX_KEY]: max })}
					/>

					{hasActiveFilters && (
						<Button variant="ghost" onClick={() => table.clearParams(DOCTOR_FILTER_KEYS)}>
							<X />
							Reset
						</Button>
					)}

					<CreateDoctorDialog />
				</div>
			</div>

			<DataTable
				data={response?.data ?? []}
				columns={doctorColumns}
				getRowId={getDoctorId}
				isLoading={isPending}
				isFetching={isFetching}
				emptyMessage={hasActiveFilters ? "No doctors match these filters." : "No doctors found."}
				sorting={{ state: table.sorting, onSortingChange: table.setSorting }}
				actions={rowAction.actions}
			/>

			<DataTablePagination meta={response?.meta} onPageChange={table.setPage} onLimitChange={table.setLimit} />

			{/* Row action dialogs: একবারে একটাই খোলে */}
			<ViewDoctorDialog {...rowAction.dialogProps("view")} />
			<EditDoctorDialog {...rowAction.dialogProps("edit")} />
			<DeleteDoctorDialog {...rowAction.dialogProps("delete")} />
		</div>
	);
}
