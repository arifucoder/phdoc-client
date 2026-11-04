import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import type { IDoctor } from "@/types/doctor.types";
import Link from "next/link";

const getDoctorInitials = (name: string) => {
	const parts = name.trim().split(/\s+/);
	const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
	return initials.join("") || "DR";
};

export default function DoctorCard({ doctor }: { doctor: IDoctor }) {
	const specialtyTitles = doctor.specialties.map((s) => s.specialty.title);

	return (
		<Card className="relative h-full gap-4 overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
			<div className="pointer-events-none absolute left-0 top-0 h-1 w-full bg-linear-to-r from-cyan-500 via-sky-500 to-blue-500 opacity-80" />

			<CardHeader className="flex items-start gap-3">
				<Avatar className="size-14 ring-2 ring-blue-100">
					<AvatarImage src={doctor.profilePhoto ?? undefined} alt={doctor.name} />
					<AvatarFallback>{getDoctorInitials(doctor.name)}</AvatarFallback>
				</Avatar>

				<div className="min-w-0 space-y-1">
					<h3 className="truncate text-base font-semibold">{doctor.name}</h3>
					<p className="truncate text-xs text-muted-foreground">{doctor.designation || "N/A"}</p>
					<p className="text-xs text-muted-foreground">{doctor.currentWorkingPlace || "N/A"}</p>
					<p className="truncate text-xs text-muted-foreground">{doctor.email}</p>
				</div>
			</CardHeader>

			<CardContent className="space-y-3">
				<div className="grid gap-2 rounded-lg bg-muted/40 p-3 text-sm">
					<p>
						<span className="font-medium">Experience:</span> {doctor.experience ?? 0} years
					</p>
					<p>
						<span className="font-medium">Fee:</span> ৳{doctor.appointmentFee}
					</p>
					<p>
						<span className="font-medium">Rating:</span> {doctor.averageRating.toFixed(1)}
					</p>
				</div>

				<div className="flex flex-wrap gap-2">
					{specialtyTitles.length > 0 ? (
						specialtyTitles.slice(0, 3).map((title) => (
							<Badge key={`${doctor.id}-${title}`} variant="secondary">
								{title}
							</Badge>
						))
					) : (
						<Badge variant="secondary">No specialties</Badge>
					)}
				</div>
			</CardContent>

			<CardFooter className="mt-auto">
				<Button asChild className="w-full">
					<Link href={`/consultation/doctor/${doctor.id}`}>View Details</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
