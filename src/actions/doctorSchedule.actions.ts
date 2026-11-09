"use server";

import { getActionErrorMessage } from "@/lib/getActionErrorMessage";
import { createMyDoctorSchedules, deleteMyDoctorSchedule } from "@/services/doctorSchedule.services";
import type { ActionResult } from "@/types/api.types";
import type { IDoctorSchedule } from "@/types/doctorSchedule.types";
import { createDoctorSchedulePayloadSchema } from "@/zod/doctorSchedule.validation";
import * as z from "zod";

const scheduleIdSchema = z.uuid("Invalid schedule id");

const firstIssue = (error: z.ZodError) => error.issues[0]?.message ?? "Invalid input";

export async function createMyDoctorSchedulesAction(payload: unknown): Promise<ActionResult<IDoctorSchedule[]>> {
	const parsed = createDoctorSchedulePayloadSchema.safeParse(payload);
	if (!parsed.success) {
		return { success: false, message: firstIssue(parsed.error) };
	}

	try {
		return await createMyDoctorSchedules(parsed.data);
	} catch (error) {
		return { success: false, message: getActionErrorMessage(error, "createMyDoctorSchedulesAction") };
	}
}

export async function deleteMyDoctorScheduleAction(scheduleId: unknown): Promise<ActionResult<unknown>> {
	const parsed = scheduleIdSchema.safeParse(scheduleId);
	if (!parsed.success) {
		return { success: false, message: firstIssue(parsed.error) };
	}

	try {
		return await deleteMyDoctorSchedule(parsed.data);
	} catch (error) {
		return { success: false, message: getActionErrorMessage(error, "deleteMyDoctorScheduleAction") };
	}
}
