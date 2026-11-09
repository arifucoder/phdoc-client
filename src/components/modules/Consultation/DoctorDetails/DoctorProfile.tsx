import { GENDER_LABELS } from "@/components/modules/Admin/DoctorsManagement/doctorsTable.config";
import StarRating from "@/components/shared/StarRating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, getInitials } from "@/lib/formatters";
import type { IDoctor } from "@/types/doctor.types";
import { BadgeCheck, Briefcase, Building2, GraduationCap, MapPin, User, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

// server component: interactivity নেই, তাই "use client" লাগে না (JS bundle-এ যায় না)

const Stat = ({ label, value }: { label: string; value: ReactNode }) => (
	<div className="rounded-xl bg-muted/50 px-4 py-3 text-center">
		<p className="text-lg font-semibold tabular-nums">{value}</p>
		<p className="text-xs text-muted-foreground">{label}</p>
	</div>
);

const InfoItem = ({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) => (
	<div className="flex gap-3">
		<Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
		<div className="min-w-0">
			<dt className="text-xs text-muted-foreground">{label}</dt>
			<dd className="text-sm font-medium break-words">{children}</dd>
		</div>
	</div>
);

export default function DoctorProfile({ doctor }: { doctor: IDoctor }) {
	const hasRating = doctor.averageRating > 0;

	return (
		<>
			{/* ---------- Header ---------- */}
			<Card className="relative overflow-hidden">
				<div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-r from-cyan-50 via-sky-50 to-blue-50 dark:from-cyan-950/40 dark:via-sky-950/30 dark:to-blue-950/40" />

				<CardContent className="relative space-y-6 pt-6">
					<div className="flex flex-col gap-5 sm:flex-row sm:items-end">
						<Avatar className="size-24 shadow-sm ring-4 ring-background">
							{doctor.profilePhoto && <AvatarImage src={doctor.profilePhoto} alt="" />}
							<AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
								{getInitials(doctor.name)}
							</AvatarFallback>
						</Avatar>

						<div className="min-w-0 space-y-1">
							<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{doctor.name}</h1>
							<p className="text-muted-foreground">
								{doctor.designation} · {doctor.currentWorkingPlace}
							</p>
							<div className="flex items-center gap-2 text-sm">
								{hasRating ? (
									<>
										<StarRating value={doctor.averageRating} />
										<span className="tabular-nums text-muted-foreground">{doctor.averageRating.toFixed(1)}</span>
									</>
								) : (
									<span className="text-muted-foreground">No ratings yet</span>
								)}
							</div>
						</div>
					</div>

					{doctor.specialties.length > 0 && (
						<ul className="flex flex-wrap gap-2" aria-label="Specialties">
							{doctor.specialties.map(({ specialty }) => (
								<li key={specialty.id}>
									<Badge variant="secondary">{specialty.title}</Badge>
								</li>
							))}
						</ul>
					)}

					<div className="grid grid-cols-3 gap-3">
						<Stat label="Experience" value={`${doctor.experience} yrs`} />
						<Stat label="Fee" value={formatCurrency(doctor.appointmentFee)} />
						<Stat label="Rating" value={hasRating ? doctor.averageRating.toFixed(1) : "—"} />
					</div>
				</CardContent>
			</Card>

			{/* ---------- About ---------- */}
			<Card>
				<CardHeader>
					<CardTitle>About</CardTitle>
				</CardHeader>
				<CardContent>
					<dl className="grid gap-5 sm:grid-cols-2">
						<InfoItem icon={GraduationCap} label="Qualification">
							{doctor.qualification}
						</InfoItem>
						<InfoItem icon={Briefcase} label="Experience">
							{doctor.experience} years
						</InfoItem>
						<InfoItem icon={Building2} label="Current workplace">
							{doctor.currentWorkingPlace}
						</InfoItem>
						<InfoItem icon={BadgeCheck} label="Registration no.">
							{doctor.registrationNumber}
						</InfoItem>
						<InfoItem icon={User} label="Gender">
							{GENDER_LABELS[doctor.gender] ?? doctor.gender}
						</InfoItem>
						{doctor.address && (
							<InfoItem icon={MapPin} label="Chamber address">
								{doctor.address}
							</InfoItem>
						)}
					</dl>
				</CardContent>
			</Card>
		</>
	);
}
