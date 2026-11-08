"use client";

import { deleteScheduleAction } from "@/actions/schedule.actions";
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
import { SCHEDULES_QUERY_KEY } from "@/queries/schedule.queries";
import type { ISchedule } from "@/types/schedule.types";
import { LoaderCircle, Trash2 } from "lucide-react";
import { isScheduleLocked } from "./schedule.utils";

interface DeleteScheduleDialogProps {
	row: ISchedule | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function DeleteScheduleDialog({ row: schedule, open, onOpenChange }: DeleteScheduleDialogProps) {
	const { mutate, isPending } = useActionMutation({
		action: deleteScheduleAction,
		invalidateKey: SCHEDULES_QUERY_KEY,
		successMessage: "Schedule deleted",
		onSuccess: () => onOpenChange(false),
	});

	const isLocked = schedule ? isScheduleLocked(schedule) : false;
	const doctorCount = schedule?.doctorSchedules?.length ?? 0;

	return (
		<AlertDialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{isLocked ? "Can't delete this slot" : "Delete this schedule?"}</AlertDialogTitle>
					<AlertDialogDescription>
						<strong className="text-foreground">
							{formatClinicDateTime(schedule?.startDateTime)} – {formatClinicTime(schedule?.endDateTime)}
						</strong>{" "}
						{isLocked
							? "has a booked appointment, so it can't be removed."
							: doctorCount > 0
								? `will be removed. ${doctorCount} assigned ${doctorCount === 1 ? "doctor" : "doctors"} will lose this slot.`
								: "will be removed."}
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>{isLocked ? "Close" : "Cancel"}</AlertDialogCancel>
					{/* AlertDialogAction না: ওটা click করলেই dialog বন্ধ করে দেয়, delete শেষ হওয়ার আগেই */}
					{!isLocked && (
						<Button
							variant="destructive"
							disabled={isPending || !schedule}
							onClick={() => schedule && mutate(schedule.id)}
						>
							{isPending ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
							{isPending ? "Deleting..." : "Delete"}
						</Button>
					)}
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
