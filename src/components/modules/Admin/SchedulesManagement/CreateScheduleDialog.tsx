"use client";

import { createScheduleAction } from "@/actions/schedule.actions";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useActionMutation } from "@/hooks/useActionMutation";
import { SCHEDULE_INTERVAL_MINUTES } from "@/lib/scheduleTime";
import { SCHEDULES_QUERY_KEY } from "@/queries/schedule.queries";
import type { ScheduleFormValues } from "@/zod/schedule.validation";
import { Plus } from "lucide-react";
import { useState } from "react";
import { EMPTY_SCHEDULE_FORM } from "./schedule.utils";
import ScheduleForm from "./ScheduleForm";

export default function CreateScheduleDialog() {
	const [open, setOpen] = useState(false);

	const { mutate, isPending } = useActionMutation({
		action: (payload: ScheduleFormValues) => createScheduleAction(payload),
		invalidateKey: SCHEDULES_QUERY_KEY,
		// skipDuplicates: সব slot আগে থেকেই থাকলে ফাঁকা array আসে
		successMessage: (created) =>
			created.length > 0
				? `${created.length} schedule slots created`
				: "These slots already exist. Nothing new was created.",
		onSuccess: () => setOpen(false), // dialog বন্ধ হলে form unmount হয় → পরের বার ফাঁকা form
	});

	return (
		<Dialog open={open} onOpenChange={(next) => !isPending && setOpen(next)}>
			<DialogTrigger asChild>
				<Button>
					<Plus />
					Create schedule
				</Button>
			</DialogTrigger>

			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Create schedule</DialogTitle>
					<DialogDescription>
						Generate {SCHEDULE_INTERVAL_MINUTES}-minute slots for every day in a date range.
					</DialogDescription>
				</DialogHeader>

				<ScheduleForm
					mode="create"
					defaultValues={EMPTY_SCHEDULE_FORM}
					onSubmit={(values) => mutate(values)}
					onCancel={() => setOpen(false)}
					isPending={isPending}
					submitLabel="Create slots"
					pendingLabel="Creating..."
				/>
			</DialogContent>
		</Dialog>
	);
}
