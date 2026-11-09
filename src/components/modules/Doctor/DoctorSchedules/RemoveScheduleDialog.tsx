"use client";

import { deleteMyDoctorScheduleAction } from "@/actions/doctorSchedule.actions";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useActionMutation } from "@/hooks/useActionMutation";
import { formatClinicDateTime, formatClinicTime } from "@/lib/scheduleTime";
import { MY_DOCTOR_SCHEDULES_QUERY_KEY } from "@/queries/doctorSchedule.queries";
import type { IDoctorSchedule } from "@/types/doctorSchedule.types";
import { LoaderCircle, Trash2 } from "lucide-react";

interface RemoveScheduleDialogProps {
	row: IDoctorSchedule | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function RemoveScheduleDialog({ row: doctorSchedule, open, onOpenChange }: RemoveScheduleDialogProps) {
	const { mutate, isPending } = useActionMutation({
		action: deleteMyDoctorScheduleAction,
		invalidateKey: MY_DOCTOR_SCHEDULES_QUERY_KEY,
		successMessage: "Slot removed from your schedule",
		onSuccess: () => onOpenChange(false),
	});

	// backend booked slot remove করতে দেয় না (400), তাই আগেই আটকাই
	const isBooked = doctorSchedule?.isBooked ?? false;

	return (
		<AlertDialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{isBooked ? "Can't remove this slot" : "Remove this slot?"}</AlertDialogTitle>
					<AlertDialogDescription>
						<strong className="text-foreground">
							{formatClinicDateTime(doctorSchedule?.schedule.startDateTime)} –{" "}
							{formatClinicTime(doctorSchedule?.schedule.endDateTime)}
						</strong>{" "}
						{isBooked
							? "already has a patient appointment, so it can't be removed."
							: "will be removed. Patients won't be able to book you at this time."}
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>{isBooked ? "Close" : "Cancel"}</AlertDialogCancel>
					{!isBooked && (
						<Button
							variant="destructive"
							disabled={isPending || !doctorSchedule}
							onClick={() => doctorSchedule && mutate(doctorSchedule.scheduleId)}
						>
							{isPending ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
							{isPending ? "Removing..." : "Remove"}
						</Button>
					)}
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
