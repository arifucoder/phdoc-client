"use client";

import { createMyDoctorSchedulesAction } from "@/actions/doctorSchedule.actions";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionMutation } from "@/hooks/useActionMutation";
import {
	addDaysToDateString,
	clinicDayStartIso,
	formatClinicTime,
	getClinicToday,
	SCHEDULE_INTERVAL_MINUTES,
} from "@/lib/scheduleTime";
import { MY_DOCTOR_SCHEDULES_QUERY_KEY, myDoctorSchedulesQueryOptions } from "@/queries/doctorSchedule.queries";
import { schedulesQueryOptions } from "@/queries/schedule.queries";
import { useQuery } from "@tanstack/react-query";
import { CalendarPlus, Check, LoaderCircle } from "lucide-react";
import { useMemo, useState } from "react";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// ওই দিনের admin-তৈরি সব slot (একদিনে সর্বোচ্চ 48টা, তাই limit 100 যথেষ্ট)
const daySlotsQueryString = (date: string) =>
	new URLSearchParams({
		startDate: date,
		endDate: date,
		limit: "100",
		sortBy: "startDateTime",
		sortOrder: "asc",
	}).toString();

// ওই দিনে আমি আগে থেকে কোনগুলো নিয়েছি
const myDaySlotsQueryString = (date: string) =>
	new URLSearchParams({
		limit: "100",
		"schedule.startDateTime[gte]": clinicDayStartIso(date),
		"schedule.startDateTime[lt]": clinicDayStartIso(addDaysToDateString(date, 1)),
	}).toString();

export default function AddSchedulesDialog() {
	const [open, setOpen] = useState(false);
	const [today, setToday] = useState("");
	const [date, setDate] = useState("");
	const [openedAt, setOpenedAt] = useState(0);
	const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(() => new Set());

	const isValidDate = ISO_DATE_REGEX.test(date);

	// enabled: false দিলেও queryKey প্রতি render-এ তৈরি হয়,
	// তাই খালি/ভুল তারিখে Date বানানোর আগেই থামাই
	const slotsQueryString = isValidDate ? daySlotsQueryString(date) : "";
	const mySlotsQueryString = isValidDate ? myDaySlotsQueryString(date) : "";

	const slotsQuery = useQuery({
		...schedulesQueryOptions(slotsQueryString),
		enabled: open && isValidDate,
	});

	const mineQuery = useQuery({
		...myDoctorSchedulesQueryOptions(mySlotsQueryString),
		enabled: open && isValidDate,
	});

	const mySlotIds = useMemo(
		() => new Set((mineQuery.data?.data ?? []).map((item) => item.scheduleId)),
		[mineQuery.data],
	);

	// backend অতীতের slot নেয় না (400), তাই দেখাই-ই না
	const slots = useMemo(
		() => (slotsQuery.data?.data ?? []).filter((slot) => new Date(slot.startDateTime).getTime() > openedAt),
		[slotsQuery.data, openedAt],
	);

	const selectableIds = slots.filter((slot) => !mySlotIds.has(slot.id)).map((slot) => slot.id);
	const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.has(id));

	const { mutate, isPending } = useActionMutation({
		action: (scheduleIds: string[]) => createMyDoctorSchedulesAction({ scheduleIds }),
		invalidateKey: MY_DOCTOR_SCHEDULES_QUERY_KEY,
		successMessage: (added) => `${added.length} ${added.length === 1 ? "slot" : "slots"} added to your schedule`,
		onSuccess: () => setOpen(false),
	});

	// Date.now() render-এর মধ্যে না, event handler-এ (React purity rule)
	const handleOpenChange = (nextOpen: boolean) => {
		if (isPending) return;

		if (nextOpen) {
			const clinicToday = getClinicToday();
			setToday(clinicToday);
			setDate(clinicToday);
			setOpenedAt(Date.now());
		}

		setSelectedIds(new Set());
		setOpen(nextOpen);
	};

	const handleDateChange = (nextDate: string) => {
		setDate(nextDate);
		setSelectedIds(new Set()); // অন্য দিনের selection রাখি না
	};

	const toggleSlot = (id: string) =>
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});

	const toggleAll = () => setSelectedIds(allSelected ? new Set() : new Set(selectableIds));

	const isLoadingSlots = slotsQuery.isLoading || mineQuery.isLoading;

	const renderSlots = () => {
		if (!isValidDate) {
			return <p className="text-sm text-muted-foreground">Pick a day to see open slots.</p>;
		}

		if (isLoadingSlots) {
			return (
				<p className="flex items-center gap-2 text-sm text-muted-foreground">
					<LoaderCircle className="size-4 animate-spin" aria-hidden />
					Loading slots...
				</p>
			);
		}

		if (slotsQuery.isError || mineQuery.isError) {
			return <p className="text-sm text-destructive">Couldn&apos;t load slots for this day. Please try again.</p>;
		}

		if (slots.length === 0) {
			return (
				<p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
					No upcoming slots on this day. Pick another day, or ask an admin to create schedules.
				</p>
			);
		}

		return (
			<ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
				{slots.map((slot) => {
					const isMine = mySlotIds.has(slot.id);
					const isSelected = selectedIds.has(slot.id);

					return (
						<li key={slot.id}>
							<Button
								type="button"
								variant={isMine ? "secondary" : isSelected ? "default" : "outline"}
								disabled={isMine || isPending}
								aria-pressed={isMine || isSelected}
								onClick={() => toggleSlot(slot.id)}
								className="h-auto w-full flex-col gap-0.5 py-2"
							>
								<span className="tabular-nums">{formatClinicTime(slot.startDateTime)}</span>
								<span className="text-xs font-normal opacity-80">
									{isMine ? (
										<span className="inline-flex items-center gap-1">
											<Check className="size-3" aria-hidden />
											Added
										</span>
									) : (
										`to ${formatClinicTime(slot.endDateTime)}`
									)}
								</span>
							</Button>
						</li>
					);
				})}
			</ul>
		);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button>
					<CalendarPlus />
					Add slots
				</Button>
			</DialogTrigger>

			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>Add slots to my schedule</DialogTitle>
					<DialogDescription>
						Pick a day, then choose the {SCHEDULE_INTERVAL_MINUTES}-minute slots when patients can book you. Times are
						Bangladesh time (GMT+6).
					</DialogDescription>
				</DialogHeader>

				<div className="flex items-end justify-between gap-3">
					<div className="space-y-1">
						<Label htmlFor="slot-day">Day</Label>
						<Input
							id="slot-day"
							type="date"
							min={today}
							value={date}
							disabled={isPending}
							onChange={(event) => handleDateChange(event.target.value)}
						/>
					</div>

					{selectableIds.length > 0 && (
						<Button type="button" variant="ghost" size="sm" onClick={toggleAll} disabled={isPending}>
							{allSelected ? "Clear all" : "Select all"}
						</Button>
					)}
				</div>

				{renderSlots()}

				<DialogFooter>
					<Button type="button" variant="outline" disabled={isPending} onClick={() => handleOpenChange(false)}>
						Cancel
					</Button>
					<Button type="button" disabled={isPending || selectedIds.size === 0} onClick={() => mutate([...selectedIds])}>
						{isPending ? <LoaderCircle className="animate-spin" /> : <Check />}
						{isPending
							? "Adding..."
							: selectedIds.size > 0
								? `Add ${selectedIds.size} ${selectedIds.size === 1 ? "slot" : "slots"}`
								: "Add slots"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
