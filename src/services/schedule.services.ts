"use server";

import { httpClient } from "@/lib/axios/httpClient";
import type { ISchedule, ISchedulePayload } from "@/types/schedule.types";

// service: শুধু backend-এ request পাঠায়। validation আর error handling action-এ হয়।

export const getSchedules = async (queryString: string) =>
	httpClient.get<ISchedule[]>(queryString ? `/schedules?${queryString}` : "/schedules");

// backend createManyAndReturn + skipDuplicates → শুধু নতুন তৈরি হওয়া slot-গুলো ফেরত দেয়
export const createSchedule = async (payload: ISchedulePayload) => httpClient.post<ISchedule[]>("/schedules", payload);

export const updateSchedule = async (id: string, payload: ISchedulePayload) =>
	httpClient.patch<ISchedule>(`/schedules/${encodeURIComponent(id)}`, payload);

// backend data পাঠায় না
export const deleteSchedule = async (id: string) => httpClient.delete<null>(`/schedules/${encodeURIComponent(id)}`);
