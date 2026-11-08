"use server";

import { getActionErrorMessage } from "@/lib/getActionErrorMessage";
import { createDoctor, deleteDoctor, updateDoctor } from "@/services/doctor.services";
import type { ActionResult } from "@/types/api.types";
import type { IDoctor } from "@/types/doctor.types";
import { createDoctorPayloadSchema, updateDoctorPayloadSchema } from "@/zod/doctor.validation";
import * as z from "zod";

// "use server" file-এর প্রতিটা export একটা public endpoint:
// যে কেউ যেকোনো মান পাঠাতে পারে, তাই input-কে unknown ধরে validate করি।
// কে create, update বা delete করতে পারবে, সেটা backend-এর checkAuth (ADMIN/SUPER_ADMIN) ঠিক করে।
const doctorIdSchema = z.uuid("Invalid doctor id");

const firstIssue = (error: z.ZodError) => error.issues[0]?.message ?? "Invalid input";

export async function createDoctorAction(payload: unknown): Promise<ActionResult<unknown>> {
	const parsed = createDoctorPayloadSchema.safeParse(payload);
	if (!parsed.success) {
		return { success: false, message: firstIssue(parsed.error) };
	}

	try {
		return await createDoctor(parsed.data);
	} catch (error) {
		return { success: false, message: getActionErrorMessage(error, "createDoctorAction") };
	}
}

export async function updateDoctorAction(id: unknown, payload: unknown): Promise<ActionResult<IDoctor>> {
	const parsedId = doctorIdSchema.safeParse(id);
	if (!parsedId.success) {
		return { success: false, message: "Invalid doctor id" };
	}

	const parsedPayload = updateDoctorPayloadSchema.safeParse(payload);
	if (!parsedPayload.success) {
		return { success: false, message: firstIssue(parsedPayload.error) };
	}

	try {
		return await updateDoctor(parsedId.data, parsedPayload.data);
	} catch (error) {
		return { success: false, message: getActionErrorMessage(error, "updateDoctorAction") };
	}
}

export async function deleteDoctorAction(id: unknown): Promise<ActionResult<IDoctor>> {
	const parsedId = doctorIdSchema.safeParse(id);
	if (!parsedId.success) {
		return { success: false, message: firstIssue(parsedId.error) };
	}

	try {
		return await deleteDoctor(parsedId.data);
	} catch (error) {
		return { success: false, message: getActionErrorMessage(error, "deleteDoctorAction") };
	}
}
