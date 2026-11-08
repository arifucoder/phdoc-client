"use server";

import { getActionErrorMessage } from "@/lib/getActionErrorMessage";
import { createSchedule, deleteSchedule, updateSchedule } from "@/services/schedule.services";
import type { ActionResult } from "@/types/api.types";
import type { ISchedule } from "@/types/schedule.types";
import { createScheduleSchema, updateScheduleSchema } from "@/zod/schedule.validation";
import * as z from "zod";

// public endpoint: input unknown ধরে validate করি। কে পারবে সেটা backend checkAuth (ADMIN/SUPER_ADMIN) ঠিক করে।
const scheduleIdSchema = z.uuid("Invalid schedule id");

const firstIssue = (error: z.ZodError) => error.issues[0]?.message ?? "Invalid input";

export async function createScheduleAction(payload: unknown): Promise<ActionResult<ISchedule[]>> {
	const parsed = createScheduleSchema.safeParse(payload);
	if (!parsed.success) {
		return { success: false, message: firstIssue(parsed.error) };
	}

	try {
		return await createSchedule(parsed.data);
	} catch (error) {
		return { success: false, message: getActionErrorMessage(error, "createScheduleAction") };
	}
}

export async function updateScheduleAction(id: unknown, payload: unknown): Promise<ActionResult<ISchedule>> {
	const parsedId = scheduleIdSchema.safeParse(id);
	if (!parsedId.success) {
		return { success: false, message: firstIssue(parsedId.error) };
	}

	const parsedPayload = updateScheduleSchema.safeParse(payload);
	if (!parsedPayload.success) {
		return { success: false, message: firstIssue(parsedPayload.error) };
	}

	try {
		return await updateSchedule(parsedId.data, parsedPayload.data);
	} catch (error) {
		return { success: false, message: getActionErrorMessage(error, "updateScheduleAction") };
	}
}

export async function deleteScheduleAction(id: unknown): Promise<ActionResult<unknown>> {
	const parsedId = scheduleIdSchema.safeParse(id);
	if (!parsedId.success) {
		return { success: false, message: firstIssue(parsedId.error) };
	}

	try {
		return await deleteSchedule(parsedId.data);
	} catch (error) {
		return { success: false, message: getActionErrorMessage(error, "deleteScheduleAction") };
	}
}
