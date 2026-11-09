"use client";

import DoctorCard from "@/components/modules/Consultation/DoctorCard";
import DataTableSearch from "@/components/shared/table/DataTableSearch";
import DataTableRangeFilter from "@/components/shared/table/filters/DataTableRangeFilter";
import DataTableSelectFilter from "@/components/shared/table/filters/DataTableSelectFilter";
import { Button } from "@/components/ui/button";
import { useTableUrlState } from "@/hooks/useTableUrlState";
import { buildQueryString } from "@/lib/buildQueryString";
import { cn } from "@/lib/utils";
import { doctorsQueryOptions } from "@/queries/doctor.queries";
import { specialtiesQueryOptions } from "@/queries/specialty.queries";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useEffect } from "react";
import {
	CONSULTATION_DEFAULTS,
	CONSULTATION_FILTER_KEYS,
	CONSULTATION_QUERY_KEYS,
	FEE_MAX_KEY,
	FEE_MIN_KEY,
	GENDER_OPTIONS,
	SORT_OPTIONS,
	SPECIALTY_FILTER_KEY,
} from "./consultation.config";
import DoctorsPagination from "./DoctorsPagination";

export default function DoctorsList() {
	// URL = source of truth। pushState শুধু URL বদলায়, server আবার চলে না; নতুন data আনে useQuery।
	const table = useTableUrlState({ defaultLimit: Number(CONSULTATION_DEFAULTS.limit) });
	const queryString = buildQueryString(table.searchParams, CONSULTATION_QUERY_KEYS, CONSULTATION_DEFAULTS);

	const {
		data: doctorsRes,
		isFetching,
		isError,
	} = useQuery({
		...doctorsQueryOptions(queryString),
		placeholderData: keepPreviousData, // নতুন result আসা পর্যন্ত পুরনোটা দেখায়
	});
	const { data: specialtiesRes } = useQuery(specialtiesQueryOptions());

	const doctors = doctorsRes?.data ?? [];
	const meta = doctorsRes?.meta;
	const specialties = specialtiesRes?.data ?? [];

	// filter দেওয়ার পর page সংখ্যা কমে গেলে শেষ page-এ ফেরা
	const { setPage } = table;
	useEffect(() => {
		if (meta && meta.totalPages > 0 && meta.page > meta.totalPages) setPage(meta.totalPages);
	}, [meta, setPage]);

	// ---------- specialty (একাধিক) ----------
	const selectedSpecialties = table.getFilterList(SPECIALTY_FILTER_KEY);
	const toggleSpecialty = (title: string) =>
		table.setFilters({
			[SPECIALTY_FILTER_KEY]: selectedSpecialties.includes(title)
				? selectedSpecialties.filter((item) => item !== title)
				: [...selectedSpecialties, title],
		});

	// ---------- sort: "field:order" ↔ SortingState ----------
	const [currentSort] = table.sorting;
	const sortValue = currentSort ? `${currentSort.id}:${currentSort.desc ? "desc" : "asc"}` : undefined;
	const handleSortChange = (value: string | undefined) => {
		if (!value) return table.setSorting([]);
		const [id = "createdAt", order] = value.split(":");
		table.setSorting([{ id, desc: order === "desc" }]);
	};

	const hasActiveFilters = CONSULTATION_FILTER_KEYS.some((key) => table.searchParams.has(key)) || Boolean(currentSort);

	const clearAll = () => table.clearParams([...CONSULTATION_FILTER_KEYS, "sortBy", "sortOrder"]);

	const handlePageChange = (page: number) => {
		table.setPage(page);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8">
			<div className="relative overflow-hidden rounded-2xl border bg-linear-to-br from-cyan-50 via-white to-blue-50 p-6 dark:from-cyan-950/40 dark:via-background dark:to-blue-950/40">
				<div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-200/30 blur-2xl" />
				<div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-cyan-200/30 blur-2xl" />
				<div className="relative space-y-3">
					<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Consult With Our Specialists</h1>
					<p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
						Discover trusted doctors, compare experience and fees, and open detailed profiles to find the right
						specialist.
					</p>
				</div>
			</div>

			{/* ---------- Filters ---------- */}
			<div className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
				<div className="flex flex-wrap items-center gap-2">
					<DataTableSearch
						value={table.searchTerm}
						onChange={table.setSearchTerm}
						placeholder="Search name, designation, specialty..."
						debounceMs={500}
					/>

					<DataTableSelectFilter
						label="Gender"
						allLabel="All genders"
						value={table.getFilter("gender")}
						options={GENDER_OPTIONS}
						onChange={(value) => table.setFilters({ gender: value })}
					/>

					<DataTableRangeFilter
						label="Fee (৳)"
						min={table.getFilter(FEE_MIN_KEY)}
						max={table.getFilter(FEE_MAX_KEY)}
						onChange={({ min, max }) => table.setFilters({ [FEE_MIN_KEY]: min, [FEE_MAX_KEY]: max })}
					/>

					<div className="ml-auto flex items-center gap-2">
						<span className="text-sm text-muted-foreground">Sort</span>
						<DataTableSelectFilter
							label="Sort doctors"
							allLabel="Newest"
							value={sortValue}
							options={SORT_OPTIONS}
							onChange={handleSortChange}
						/>
					</div>
				</div>

				{specialties.length > 0 && (
					<div className="space-y-2">
						<p className="text-sm font-medium">Specialties</p>
						<div className="flex flex-wrap gap-2">
							{specialties.map((specialty) => {
								const isSelected = selectedSpecialties.includes(specialty.title);
								return (
									<Button
										key={specialty.id}
										type="button"
										size="sm"
										variant={isSelected ? "default" : "outline"}
										aria-pressed={isSelected}
										className="rounded-full"
										onClick={() => toggleSpecialty(specialty.title)}
									>
										{specialty.title}
									</Button>
								);
							})}
						</div>
					</div>
				)}

				{hasActiveFilters && (
					<div className="flex justify-end">
						<Button type="button" variant="ghost" size="sm" onClick={clearAll}>
							<X />
							Clear all
						</Button>
					</div>
				)}
			</div>

			{/* ---------- Results ---------- */}
			{isError && !doctorsRes ? (
				<p className="rounded-2xl border border-dashed p-10 text-center text-destructive">
					Couldn&apos;t load doctors. Please try again.
				</p>
			) : doctors.length === 0 ? (
				<div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
					No doctors found. Try changing the filters.
				</div>
			) : (
				<div
					aria-busy={isFetching}
					className={cn("grid gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3", isFetching && "opacity-60")}
				>
					{doctors.map((doctor) => (
						<DoctorCard key={doctor.id} doctor={doctor} />
					))}
				</div>
			)}

			<div className="space-y-3">
				<DoctorsPagination
					page={meta?.page ?? 1}
					totalPages={meta?.totalPages ?? 1}
					disabled={isFetching}
					onPageChange={handlePageChange}
				/>
				{meta && (
					<p className="text-center text-sm text-muted-foreground">
						{meta.total} {meta.total === 1 ? "doctor" : "doctors"} found
					</p>
				)}
			</div>
		</section>
	);
}
