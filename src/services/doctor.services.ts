"use server";

import { httpClient } from "@/lib/axios/httpClient";
import type { ICreateDoctorPayload, IDoctor, IUpdateDoctorPayload } from "@/types/doctor.types";

// service: শুধু backend-এ request পাঠায়। validation আর error handling action-এ হয়।

export const getDoctors = async (queryString: string) =>
	httpClient.get<IDoctor[]>(queryString ? `/doctors?${queryString}` : "/doctors");

// backend route: /user (s ছাড়া), teacher-এর /users না
export const createDoctor = async (payload: ICreateDoctorPayload) =>
	httpClient.post<unknown>("/user/create-doctor", payload);

export const updateDoctor = async (id: string, payload: IUpdateDoctorPayload) =>
	httpClient.patch<IDoctor>(`/doctors/${encodeURIComponent(id)}`, payload);

export const deleteDoctor = async (id: string) => httpClient.delete<IDoctor>(`/doctors/${encodeURIComponent(id)}`);
