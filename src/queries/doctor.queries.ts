import { getDoctors } from "@/services/doctor.services";
import { queryOptions } from "@tanstack/react-query";

// mutation-এর পর ["doctors"] invalidate করলে সব doctor list (যেকোনো filter বা page) আবার আসবে
export const DOCTORS_QUERY_KEY = ["doctors"] as const;

export const doctorsQueryOptions = (queryString: string) =>
	queryOptions({
		queryKey: [...DOCTORS_QUERY_KEY, queryString],
		queryFn: () => getDoctors(queryString),
		staleTime: 1000 * 60 * 60, // 1 ঘণ্টা (বদলালে invalidate করি, তাই লম্বা রাখা নিরাপদ)
		gcTime: 1000 * 60 * 60 * 6, // 6 ঘণ্টা
	});
