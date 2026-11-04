"use server";

import { httpClient } from "@/lib/axios/httpClient";
import type { ISpecialty } from "@/types/specialty.types";

export const getAllSpecialties = async () => {
	return httpClient.get<ISpecialty[]>("/specialties");
};

export const createSpecialty = async (payload: { title: string; description?: string }) => {
	return httpClient.post<ISpecialty>("/specialties", payload);
};
