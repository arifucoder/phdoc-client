"use client";

import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Button } from "@/components/ui/button";
import { SCHEDULE_INTERVAL_MINUTES } from "@/lib/scheduleTime";
import { createScheduleSchema, type ScheduleFormValues, updateScheduleSchema } from "@/zod/schedule.validation";
import { useForm } from "@tanstack/react-form";
import { countSlots } from "./schedule.utils";

interface ScheduleFormProps {
	mode: "create" | "edit";
	defaultValues: ScheduleFormValues;
	onSubmit: (values: ScheduleFormValues) => void;
	onCancel: () => void;
	isPending: boolean;
	submitLabel: string;
	pendingLabel: string;
}

export default function ScheduleForm({
	mode,
	defaultValues,
	onSubmit,
	onCancel,
	isPending,
	submitLabel,
	pendingLabel,
}: ScheduleFormProps) {
	const isCreate = mode === "create";

	// form-level schema: refine (end ≥ start) চলে, error নিজের path-এর field-এ বসে।
	// teacher-এর field-level `.shape.x` দিলে refine কখনো চলত না।
	const form = useForm({
		defaultValues,
		validators: { onChange: isCreate ? createScheduleSchema : updateScheduleSchema },
		onSubmit: ({ value }) => onSubmit(value),
	});

	return (
		<form
			noValidate
			className="space-y-5"
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				void form.handleSubmit();
			}}
		>
			{/* fieldset disabled: save চলার সময় সব input একসাথে বন্ধ */}
			<fieldset disabled={isPending} className="grid gap-4 sm:grid-cols-2">
				<form.Field name="startDate">{(field) => <AppField field={field} label="Start date" type="date" />}</form.Field>

				<form.Field name="endDate">{(field) => <AppField field={field} label="End date" type="date" />}</form.Field>

				<form.Field name="startTime">
					{(field) => <AppField field={field} label={isCreate ? "Daily start time" : "Start time"} type="time" />}
				</form.Field>

				<form.Field name="endTime">
					{(field) => <AppField field={field} label={isCreate ? "Daily end time" : "End time"} type="time" />}
				</form.Field>
			</fieldset>

			{/* create-এ কয়টা slot হবে আগেই দেখাই */}
			{isCreate && (
				<form.Subscribe selector={(state) => state.values}>
					{(values) => {
						const count = countSlots(values);

						return (
							<p aria-live="polite" className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
								{count > 0 ? (
									<>
										Up to <strong className="tabular-nums text-foreground">{count}</strong> slots of{" "}
										{SCHEDULE_INTERVAL_MINUTES} minutes will be created. Existing slots are skipped.
									</>
								) : (
									`Pick a date range and a daily time window. Each slot is ${SCHEDULE_INTERVAL_MINUTES} minutes.`
								)}
							</p>
						);
					}}
				</form.Subscribe>
			)}

			<p className="text-xs text-muted-foreground">All times are Bangladesh time (GMT+6).</p>

			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
					Cancel
				</Button>
				<AppSubmitButton isPending={isPending} pendingLabel={pendingLabel} className="w-auto">
					{submitLabel}
				</AppSubmitButton>
			</div>
		</form>
	);
}
