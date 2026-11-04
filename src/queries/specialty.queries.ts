import { getAllSpecialties } from "@/services/specialty.services";
import { queryOptions } from "@tanstack/react-query";

export const specialtiesQueryOptions = () =>
	queryOptions({
		queryKey: ["specialties"],
		queryFn: getAllSpecialties,
		staleTime: 1000 * 60 * 60 * 6,
		gcTime: 1000 * 60 * 60 * 24,
	});
