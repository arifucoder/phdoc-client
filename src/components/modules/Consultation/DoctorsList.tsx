"use client";

import DoctorCard from "@/components/modules/Consultation/DoctorCard";
import { Badge } from "@/components/ui/badge";
import { doctorsQueryOptions } from "@/queries/doctor.queries";
import { specialtiesQueryOptions } from "@/queries/specialty.queries";
import { useQuery } from "@tanstack/react-query";

export default function DoctorsList({ queryString }: { queryString: string }) {
	const { data: doctorsRes, isFetching } = useQuery(doctorsQueryOptions(queryString));
	const { data: specialtiesRes } = useQuery(specialtiesQueryOptions());

	const doctors = doctorsRes?.data ?? [];
	const meta = doctorsRes?.meta;
	const specialties = specialtiesRes?.data ?? [];

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

			{specialties.length > 0 && (
				<div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
					<p className="mb-3 text-sm font-medium">Specialties</p>
					<div className="flex flex-wrap gap-2">
						{specialties.map((s) => (
							<Badge key={s.id} variant="outline">
								{s.title}
							</Badge>
						))}
					</div>
				</div>
			)}

			{isFetching && <p className="text-sm text-muted-foreground">Updating doctors...</p>}

			{doctors.length === 0 ? (
				<div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">No doctors found.</div>
			) : (
				<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{doctors.map((doctor) => (
						<DoctorCard key={doctor.id} doctor={doctor} />
					))}
				</div>
			)}

			<p className="text-center text-sm text-muted-foreground">Total {meta?.total ?? doctors.length} doctors</p>
		</section>
	);
}
