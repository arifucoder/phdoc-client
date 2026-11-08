"use client";

import DateCell from "@/components/shared/table/cells/DateCell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, getInitials } from "@/lib/formatters";
import type { IDoctor } from "@/types/doctor.types";
import { ExternalLink, Star } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { GENDER_LABELS } from "./doctorsTable.config";

interface ViewDoctorDialogProps {
	row: IDoctor | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

// <dl>: label আর value-র জোড়া, screen reader সঠিকভাবে পড়ে
const DetailItem = ({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) => (
	<div className={wide ? "sm:col-span-2" : undefined}>
		<dt className="text-xs text-muted-foreground">{label}</dt>
		<dd className="mt-0.5 text-sm font-medium break-words">{children}</dd>
	</div>
);

const EMPTY = <span className="font-normal text-muted-foreground">—</span>;

export default function ViewDoctorDialog({ row: doctor, open, onOpenChange }: ViewDoctorDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
				{doctor && (
					<>
						<DialogHeader>
							<div className="flex items-center gap-4">
								<Avatar className="size-16">
									{doctor.profilePhoto && <AvatarImage src={doctor.profilePhoto} alt="" />}
									<AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
										{getInitials(doctor.name)}
									</AvatarFallback>
								</Avatar>

								<div className="min-w-0 text-left">
									<DialogTitle className="truncate">{doctor.name}</DialogTitle>
									<DialogDescription>
										{doctor.designation} · {doctor.currentWorkingPlace}
									</DialogDescription>
									<p className="mt-1 inline-flex items-center gap-1 text-sm tabular-nums">
										<Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
										{doctor.averageRating.toFixed(1)}
										<span className="sr-only">out of 5 rating</span>
									</p>
								</div>
							</div>
						</DialogHeader>

						{doctor.specialties.length > 0 && (
							<div className="flex flex-wrap gap-1.5">
								{doctor.specialties.map(({ specialty }) => (
									<Badge key={specialty.id} variant="secondary">
										{specialty.title}
									</Badge>
								))}
							</div>
						)}

						<Separator />

						<dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
							<DetailItem label="Email">{doctor.email}</DetailItem>
							<DetailItem label="Phone">{doctor.contactNumber || EMPTY}</DetailItem>
							<DetailItem label="Gender">{GENDER_LABELS[doctor.gender] ?? doctor.gender}</DetailItem>
							<DetailItem label="Experience">{doctor.experience} years</DetailItem>
							<DetailItem label="Appointment fee">{formatCurrency(doctor.appointmentFee)}</DetailItem>
							<DetailItem label="Registration no.">{doctor.registrationNumber}</DetailItem>
							<DetailItem label="Qualification" wide>
								{doctor.qualification}
							</DetailItem>
							<DetailItem label="Address" wide>
								{doctor.address || EMPTY}
							</DetailItem>
							<DetailItem label="Joined">
								<DateCell value={doctor.createdAt} />
							</DetailItem>
						</dl>

						<DialogFooter>
							<Button variant="outline" asChild>
								<Link href={`/consultation/doctor/${doctor.id}`}>
									<ExternalLink />
									Public profile
								</Link>
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
