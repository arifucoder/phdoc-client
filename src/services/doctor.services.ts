"use server";

import { httpClient } from "@/lib/axios/httpClient";
import type { IDoctor } from "@/types/doctor.types";

export const getDoctors = async (queryString: string) => {
	return httpClient.get<IDoctor[]>(queryString ? `/doctors?${queryString}` : "/doctors");
};
