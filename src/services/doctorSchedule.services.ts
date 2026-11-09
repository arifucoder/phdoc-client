"use server";

import { httpClient } from "@/lib/axios/httpClient";
import type { IAvailableSlot, ICreateDoctorSchedulePayload, IDoctorSchedule } from "@/types/doctorSchedule.types";

// সব route checkAuth(DOCTOR): logged-in doctor নিজেরটাই দেখে/বদলায়

export const getMyDoctorSchedules = async (queryString: string) =>
	httpClient.get<IDoctorSchedule[]>(
		queryString ? `/doctor-schedules/my-doctor-schedules?${queryString}` : "/doctor-schedules/my-doctor-schedules",
	);

// skipDuplicates: আগে নেওয়া slot আবার পাঠালে error না
export const createMyDoctorSchedules = async (payload: ICreateDoctorSchedulePayload) =>
	httpClient.post<IDoctorSchedule[]>("/doctor-schedules/create-my-doctor-schedule", payload);

export const deleteMyDoctorSchedule = async (scheduleId: string) =>
	httpClient.delete<null>(`/doctor-schedules/delete-my-doctor-schedule/${encodeURIComponent(scheduleId)}`);

// public route: login ছাড়াও চলে
export const getAvailableDoctorSlots = async (doctorId: string, startDate: string, endDate: string) =>
	httpClient.get<IAvailableSlot[]>(`/doctor-schedules/doctor/${encodeURIComponent(doctorId)}/available`, {
		params: { startDate, endDate },
	});
