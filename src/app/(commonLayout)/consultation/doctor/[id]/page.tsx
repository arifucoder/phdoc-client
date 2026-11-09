import DoctorBookingCard from "@/components/modules/Consultation/DoctorDetails/DoctorBookingCard";
import DoctorProfile from "@/components/modules/Consultation/DoctorDetails/DoctorProfile";
import DoctorReviews from "@/components/modules/Consultation/DoctorDetails/DoctorReviews";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { getQueryClient } from "@/lib/getQueryClient";
import { addDaysToDateString, BOOKING_WINDOW_DAYS, getClinicToday } from "@/lib/scheduleTime";
import { getSessionUser } from "@/lib/session";
import { availableSlotsQueryOptions } from "@/queries/doctorSchedule.queries";
import { getDoctorById } from "@/services/doctor.services";
import { getReviews } from "@/services/review.services";
import { dehydrate, HydrationBoundary, noop } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import * as z from "zod";

const REVIEW_PREVIEW_LIMIT = "5";
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

type SearchParams = Record<string, string | string[] | undefined>;

// ভুল id বা মুছে ফেলা doctor → 404 page (error box না)
const getDoctorOrNotFound = async (id: string) => {
	// UUID না হলে backend-এ request পাঠানোরই দরকার নেই
	if (!z.uuid().safeParse(id).success) notFound();

	try {
		const response = await getDoctorById(id);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 404) notFound();
		throw error; // বাকি error (500, network) → error.tsx
	}
};

async function DoctorDetails({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>;
	searchParams: Promise<SearchParams>;
}) {
	const [{ id }, query] = await Promise.all([params, searchParams]);

	// connection(): Next-কে বলে "এই অংশ prerender করো না, প্রতিটা request-এ চালাও"।
	// params/searchParams await করাই যথেষ্ট না (prerender-এ ওদের fallback থাকতে পারে)।
	// এর পরে new Date() নিরাপদ: "আজ" সবসময় আসল আজকের তারিখ।
	await connection();

	// ঢাকার তারিখ server-এ ঠিক হয় → client-এ একই মান যায়, hydration mismatch নেই
	const today = getClinicToday();
	const endDate = addDaysToDateString(today, BOOKING_WINDOW_DAYS - 1);

	// login থেকে ফিরলে ?date=... দিয়ে আগের বাছা দিনটা খোলে
	const requestedDate = typeof query.date === "string" && ISO_DATE_REGEX.test(query.date) ? query.date : undefined;

	const reviewsQuery = new URLSearchParams({
		doctorId: id,
		limit: REVIEW_PREVIEW_LIMIT,
		sortBy: "createdAt",
		sortOrder: "desc",
	}).toString();

	const queryClient = getQueryClient();

	// সব একসাথে। review বা slot না এলে page ভাঙে না।
	const [doctor, reviewsResponse, viewer] = await Promise.all([
		getDoctorOrNotFound(id),
		getReviews(reviewsQuery).catch(() => null),
		getSessionUser(),
		queryClient.query(availableSlotsQueryOptions(id, today, endDate)).catch(noop),
	]);

	return (
		// DOM ক্রম: profile → booking → reviews (mobile-এ booking উপরের দিকে থাকে)।
		// desktop-এ grid দিয়ে booking ডান column-এ, পুরো উচ্চতা জুড়ে, sticky।
		<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
			<div className="space-y-6 lg:col-start-1">
				<DoctorProfile doctor={doctor} />
			</div>

			<aside className="lg:col-start-2 lg:row-span-2 lg:row-start-1" aria-label="Book an appointment">
				<div className="lg:sticky lg:top-20">
					<HydrationBoundary state={dehydrate(queryClient)}>
						{/* client component-এ শুধু দরকারি field পাঠাই (পুরো doctor object না) */}
						<DoctorBookingCard
							doctor={{ id: doctor.id, name: doctor.name, appointmentFee: doctor.appointmentFee }}
							viewerRole={viewer?.role ?? null}
							today={today}
							initialDate={requestedDate}
						/>
					</HydrationBoundary>
				</div>
			</aside>

			<div className="lg:col-start-1">
				<DoctorReviews reviews={reviewsResponse?.data ?? null} total={reviewsResponse?.meta?.total ?? 0} />
			</div>
		</div>
	);
}

export default function ConsultationDoctorPage({ params, searchParams }: PageProps<"/consultation/doctor/[id]">) {
	return (
		<section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8">
			<Button asChild variant="ghost" size="sm" className="-ml-2">
				<Link href="/consultation">
					<ArrowLeft />
					All doctors
				</Link>
			</Button>

			{/* cacheComponents: request data (params, cookie, সময়) Suspense-এর ভেতরে পড়তে হয় */}
			<Suspense fallback={<LoadingSpinner text="Loading doctor..." />}>
				<DoctorDetails params={params} searchParams={searchParams} />
			</Suspense>
		</section>
	);
}
