import { getSchedules } from "@/services/schedule.services";
import { queryOptions } from "@tanstack/react-query";

// ["schedules"] invalidate করলে সব page/filter-এর list আবার আসবে
export const SCHEDULES_QUERY_KEY = ["schedules"] as const;

export const schedulesQueryOptions = (queryString: string) =>
	queryOptions({
		queryKey: [...SCHEDULES_QUERY_KEY, queryString],
		queryFn: () => getSchedules(queryString),
		// doctor-দের booking অন্য জায়গা থেকে হয় (admin invalidate করে না), তাই doctors-এর চেয়ে ছোট
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 30,
	});
