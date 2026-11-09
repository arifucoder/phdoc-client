"use client";

import { bookAppointmentAction } from "@/actions/appointment.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useActionMutation } from "@/hooks/useActionMutation";
import { formatCurrency } from "@/lib/formatters";
import {
	addDaysToDateString,
	BOOKING_WINDOW_DAYS,
	formatClinicDayParts,
	formatClinicTime,
	SCHEDULE_INTERVAL_MINUTES,
	toClinicDateTimeParts,
} from "@/lib/scheduleTime";
import { cn } from "@/lib/utils";
import { AVAILABLE_SLOTS_QUERY_KEY, availableSlotsQueryOptions } from "@/queries/doctorSchedule.queries";
import type { PaymentMode } from "@/types/appointment.types";
import type { UserRole } from "@/types/auth.types";
import type { IDoctor } from "@/types/doctor.types";
import type { IAvailableSlot } from "@/types/doctorSchedule.types";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, CalendarX, CreditCard, LoaderCircle, LogIn } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const UNPAID_TIMEOUT_MINUTES = 30; // backend UNPAID_APPOINTMENT_TIMEOUT_MINUTES

interface DoctorBookingCardProps {
	doctor: Pick<IDoctor, "id" | "name" | "appointmentFee">;
	viewerRole: UserRole | null; // null = login করা নেই
	today: string; // server থেকে (ঢাকার তারিখ) → server আর browser-এ একই, hydration mismatch নেই
	initialDate?: string; // login থেকে ফিরলে ?date=...
}

export default function DoctorBookingCard({ doctor, viewerRole, today, initialDate }: DoctorBookingCardProps) {
	const router = useRouter();
	const pathname = usePathname();
	const endDate = addDaysToDateString(today, BOOKING_WINDOW_DAYS - 1);

	const [pickedDate, setPickedDate] = useState<string | null>(initialDate ?? null);
	const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

	// server prefetch করেছে → প্রথম render-এই data থাকে
	const { data, isPending, isError, refetch } = useQuery(availableSlotsQueryOptions(doctor.id, today, endDate));

	// দিন অনুযায়ী ভাগ (backend আগেই সময় অনুযায়ী সাজিয়ে দেয়, তাই Map-এর ক্রমও ঠিক থাকে)
	const slotsByDate = useMemo(() => {
		const map = new Map<string, IAvailableSlot[]>();
		for (const slot of data?.data ?? []) {
			const { date } = toClinicDateTimeParts(slot.startDateTime);
			const list = map.get(date);
			if (list) list.push(slot);
			else map.set(date, [slot]);
		}
		return map;
	}, [data]);

	const availableDates = [...slotsByDate.keys()];

	// derived state: বাছা দিনে আর slot না থাকলে (অন্য কেউ book করেছে) প্রথম খালি দিনে চলে যায়।
	// effect দিয়ে state sync করার দরকার নেই।
	const activeDate = pickedDate && slotsByDate.has(pickedDate) ? pickedDate : (availableDates[0] ?? null);
	const daySlots = activeDate ? (slotsByDate.get(activeDate) ?? []) : [];
	const selectedSlot = daySlots.find((slot) => slot.id === selectedSlotId) ?? null;

	const {
		mutate,
		isPending: isBooking,
		variables,
	} = useActionMutation({
		action: ({ scheduleId, mode }: { scheduleId: string; mode: PaymentMode }) =>
			bookAppointmentAction({ doctorId: doctor.id, scheduleId }, mode),
		invalidateKey: AVAILABLE_SLOTS_QUERY_KEY,
		successMessage: (result) =>
			result.paymentUrl
				? "Slot reserved. Taking you to payment..."
				: `Appointment booked. Please pay within ${UNPAID_TIMEOUT_MINUTES} minutes.`,
		onSuccess: (result) => {
			// Stripe অন্য site, তাই router না, পুরো page navigation
			if (result.paymentUrl) {
				window.location.assign(result.paymentUrl);
				return;
			}
			router.push("/dashboard/my-appointments");
		},
	});

	const handleBook = (mode: PaymentMode) => {
		if (!selectedSlot) return;

		mutate(
			{ scheduleId: selectedSlot.id, mode },
			{
				// 409 (অন্য কেউ এইমাত্র book করেছে) → নতুন তালিকা আনো, selection মুছে দাও
				onError: () => {
					setSelectedSlotId(null);
					void refetch();
				},
			},
		);
	};

	const handleLogin = () => {
		// login-এর পর এই page, এই দিনেই ফেরত (authUtils.getPostLoginRedirect নিরাপদে check করে)
		const backTo = activeDate ? `${pathname}?date=${activeDate}` : pathname;
		router.push(`/login?redirect=${encodeURIComponent(backTo)}`);
	};

	const handlePickDate = (date: string) => {
		setPickedDate(date);
		setSelectedSlotId(null);
	};

	// ---------- slot অংশ ----------
	const renderSlots = () => {
		if (isPending) {
			return (
				<p className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
					<LoaderCircle className="size-4 animate-spin" aria-hidden />
					Loading available slots...
				</p>
			);
		}

		if (isError) {
			return (
				<div className="space-y-2 py-4 text-center">
					<p className="text-sm text-destructive">Couldn&apos;t load available slots.</p>
					<Button variant="outline" size="sm" onClick={() => void refetch()}>
						Try again
					</Button>
				</div>
			);
		}

		if (availableDates.length === 0) {
			return (
				<div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-6 text-center">
					<CalendarX className="size-6 text-muted-foreground" aria-hidden />
					<p className="text-sm text-muted-foreground">
						No open slots in the next {BOOKING_WINDOW_DAYS} days. Please check back later.
					</p>
				</div>
			);
		}

		return (
			<div className="space-y-4">
				{/* দিন */}
				<div>
					<p className="mb-2 text-sm font-medium">Choose a day</p>
					<div role="group" aria-label="Available days" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
						{availableDates.map((date) => {
							const { weekday, day, month } = formatClinicDayParts(date);
							const isActive = date === activeDate;

							return (
								<Button
									key={date}
									type="button"
									variant={isActive ? "default" : "outline"}
									aria-pressed={isActive}
									disabled={isBooking}
									onClick={() => handlePickDate(date)}
									className="h-auto w-16 shrink-0 flex-col gap-0 py-2"
								>
									<span className="text-xs font-normal opacity-80">{weekday}</span>
									<span className="text-lg leading-tight font-semibold tabular-nums">{day}</span>
									<span className="text-xs font-normal opacity-80">{month}</span>
								</Button>
							);
						})}
					</div>
				</div>

				{/* সময় */}
				<div>
					<p className="mb-2 text-sm font-medium">
						Choose a time <span className="font-normal text-muted-foreground">(Bangladesh time)</span>
					</p>
					<div role="group" aria-label="Available times" className="grid grid-cols-3 gap-2">
						{daySlots.map((slot) => {
							const isSelected = slot.id === selectedSlotId;

							return (
								<Button
									key={slot.id}
									type="button"
									size="sm"
									variant={isSelected ? "default" : "outline"}
									aria-pressed={isSelected}
									disabled={isBooking}
									onClick={() => setSelectedSlotId(isSelected ? null : slot.id)}
									className="tabular-nums"
								>
									{formatClinicTime(slot.startDateTime)}
								</Button>
							);
						})}
					</div>
				</div>
			</div>
		);
	};

	// ---------- নিচের button অংশ (কে দেখছে তার উপর নির্ভর করে) ----------
	const renderActions = () => {
		if (!viewerRole) {
			return (
				<Button className="w-full" onClick={handleLogin}>
					<LogIn />
					Log in to book
				</Button>
			);
		}

		if (viewerRole !== "PATIENT") {
			return (
				<p className="w-full rounded-md bg-muted px-3 py-2 text-center text-sm text-muted-foreground">
					Only patient accounts can book appointments.
				</p>
			);
		}

		const isPayNowPending = isBooking && variables?.mode === "pay-now";
		const isPayLaterPending = isBooking && variables?.mode === "pay-later";

		return (
			<div className="w-full space-y-2">
				<Button className="w-full" disabled={!selectedSlot || isBooking} onClick={() => handleBook("pay-now")}>
					{isPayNowPending ? <LoaderCircle className="animate-spin" /> : <CreditCard />}
					{isPayNowPending ? "Reserving..." : `Pay ${formatCurrency(doctor.appointmentFee)} & book`}
				</Button>
				<Button
					variant="outline"
					className="w-full"
					disabled={!selectedSlot || isBooking}
					onClick={() => handleBook("pay-later")}
				>
					{isPayLaterPending && <LoaderCircle className="animate-spin" />}
					{isPayLaterPending ? "Booking..." : "Book now, pay later"}
				</Button>
				<p className="text-center text-xs text-muted-foreground">
					Unpaid bookings are cancelled after {UNPAID_TIMEOUT_MINUTES} minutes.
				</p>
			</div>
		);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Book an appointment</CardTitle>
				<CardDescription>Pick a time that works for you with {doctor.name}.</CardDescription>
			</CardHeader>

			<CardContent className="space-y-4">
				<dl className="space-y-2 text-sm">
					<div className="flex items-center justify-between">
						<dt className="text-muted-foreground">Consultation fee</dt>
						<dd className="text-lg font-semibold tabular-nums">{formatCurrency(doctor.appointmentFee)}</dd>
					</div>
					<div className="flex items-center justify-between">
						<dt className="text-muted-foreground">Duration</dt>
						<dd className="font-medium">{SCHEDULE_INTERVAL_MINUTES} minutes</dd>
					</div>
				</dl>

				<Separator />

				{renderSlots()}

				{/* বাছাইয়ের সারাংশ: কী book হচ্ছে স্পষ্ট দেখায় */}
				<div
					aria-live="polite"
					className={cn(
						"flex items-center gap-2 rounded-md px-3 py-2 text-sm",
						selectedSlot ? "bg-primary/10 text-foreground" : "bg-muted text-muted-foreground",
					)}
				>
					<CalendarClock className="size-4 shrink-0" aria-hidden />
					{selectedSlot && activeDate ? (
						<span>
							{(() => {
								const { weekday, day, month } = formatClinicDayParts(activeDate);
								return `${weekday}, ${day} ${month}`;
							})()}{" "}
							· {formatClinicTime(selectedSlot.startDateTime)} – {formatClinicTime(selectedSlot.endDateTime)}
						</span>
					) : (
						<span>No time selected</span>
					)}
				</div>
			</CardContent>

			<CardFooter>{renderActions()}</CardFooter>
		</Card>
	);
}
