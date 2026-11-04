import { getDoctors } from "@/services/doctor.services";
import { queryOptions } from "@tanstack/react-query";

export const doctorsQueryOptions = (queryString: string) =>
	queryOptions({
		queryKey: ["doctors", queryString],
		queryFn: () => getDoctors(queryString),
		staleTime: 1000 * 60 * 60, // 1 ঘণ্টা
		gcTime: 1000 * 60 * 60 * 6, // 6 ঘণ্টা
	});
