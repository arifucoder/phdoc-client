"use client";

import DateCell from "@/components/shared/table/cells/DateCell";
import UserInfoCell from "@/components/shared/table/cells/UserInfoCell";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatClinicTime, getDurationMinutes } from "@/lib/scheduleTime";
import type { ISchedule } from "@/types/schedule.types";
import type { ReactNode } from "react";
import { getBookedCount } from "./schedule.utils";

interface ViewScheduleDialogProps {
	row: ISchedule | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const DetailItem = ({ label, children }: { label: string; children: ReactNode }) => (
	<div>
		<dt className="text-xs text-muted-foreground">{label}</dt>
		<dd className="mt-0.5 text-sm font-medium">{children}</dd>
	</div>
);

// row-এ দরকারি সব data আগেই আছে (include=doctorSchedules), তাই teacher-এর মতো আলাদা getById request লাগে না
export default function ViewScheduleDialog({ row: schedule, open, onOpenChange }: ViewScheduleDialogProps) {
	const links = schedule?.doctorSchedules ?? [];
	const duration = schedule ? getDurationMinutes(schedule.startDateTime, schedule.endDateTime) : null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
				{schedule && (
					<>
						<DialogHeader>
							<DialogTitle>Schedule details</DialogTitle>
							<DialogDescription>
								{formatClinicTime(schedule.startDateTime)} – {formatClinicTime(schedule.endDateTime)} (Bangladesh time)
							</DialogDescription>
						</DialogHeader>

						<dl className="grid grid-cols-2 gap-x-6 gap-y-4">
							<DetailItem label="Date">
								<DateCell value={schedule.startDateTime} />
							</DetailItem>
							<DetailItem label="Duration">{duration ? `${duration} minutes` : "—"}</DetailItem>
							<DetailItem label="Doctors assigned">{links.length}</DetailItem>
							<DetailItem label="Booked">{getBookedCount(schedule)}</DetailItem>
							<DetailItem label="Created">
								<DateCell value={schedule.createdAt} />
							</DetailItem>
						</dl>

						<Separator />

						<section className="space-y-3">
							<h3 className="text-sm font-semibold">Assigned doctors</h3>

							{links.length === 0 ? (
								<p className="text-sm text-muted-foreground">No doctor has picked this slot yet.</p>
							) : (
								<ul className="space-y-2">
									{links.map(({ doctor, doctorId, isBooked }) => (
										<li key={doctorId} className="flex items-center justify-between gap-3 rounded-md border p-2">
											<UserInfoCell name={doctor.name} email={doctor.email} image={doctor.profilePhoto} />
											<Badge variant={isBooked ? "default" : "outline"}>{isBooked ? "Booked" : "Available"}</Badge>
										</li>
									))}
								</ul>
							)}
						</section>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
