"use client";

import { updateScheduleAction } from "@/actions/schedule.actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useActionMutation } from "@/hooks/useActionMutation";
import { formatClinicDateTime } from "@/lib/scheduleTime";
import { SCHEDULES_QUERY_KEY } from "@/queries/schedule.queries";
import type { ISchedule } from "@/types/schedule.types";
import type { ScheduleFormValues } from "@/zod/schedule.validation";
import { CalendarX } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { isSameFormValues, isScheduleLocked, scheduleToFormValues } from "./schedule.utils";
import ScheduleForm from "./ScheduleForm";

interface EditScheduleDialogProps {
	row: ISchedule | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function EditScheduleDialog({ row: schedule, open, onOpenChange }: EditScheduleDialogProps) {
	const { mutate, isPending } = useActionMutation({
		action: ({ id, payload }: { id: string; payload: ScheduleFormValues }) => updateScheduleAction(id, payload),
		invalidateKey: SCHEDULES_QUERY_KEY,
		successMessage: (updated) => `Schedule moved to ${formatClinicDateTime(updated.startDateTime)}`,
		onSuccess: () => onOpenChange(false),
	});

	// useMemo: প্রতি render-এ নতুন object দিলে form নিজেকে reset করতে পারে
	const defaultValues = useMemo(() => (schedule ? scheduleToFormValues(schedule) : null), [schedule]);
	const isLocked = schedule ? isScheduleLocked(schedule) : false;

	const handleSubmit = (values: ScheduleFormValues) => {
		if (!schedule || !defaultValues) return;

		if (isSameFormValues(values, defaultValues)) {
			toast.info("No changes to save");
			return;
		}

		mutate({ id: schedule.id, payload: values });
	};

	return (
		<Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Edit schedule</DialogTitle>
					<DialogDescription>Change the start and end of this slot.</DialogDescription>
				</DialogHeader>

				{isLocked && (
					<Alert variant="destructive">
						<CalendarX />
						<AlertTitle>This slot is booked</AlertTitle>
						<AlertDescription>
							A patient already has an appointment in this slot, so its time can&apos;t be changed.
						</AlertDescription>
					</Alert>
				)}

				{schedule && defaultValues && !isLocked && (
					// key: অন্য schedule খুললে form একদম নতুন করে শুরু হয়
					<ScheduleForm
						key={schedule.id}
						mode="edit"
						defaultValues={defaultValues}
						onSubmit={handleSubmit}
						onCancel={() => onOpenChange(false)}
						isPending={isPending}
						submitLabel="Save changes"
						pendingLabel="Saving..."
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}
