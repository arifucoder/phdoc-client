"use server";

import { getActionErrorMessage } from "@/lib/getActionErrorMessage";
import { bookAppointment, bookAppointmentWithPayLater } from "@/services/appointment.services";
import type { ActionResult } from "@/types/api.types";
import type { IBookAppointmentResult } from "@/types/appointment.types";
import { bookAppointmentPayloadSchema, paymentModeSchema } from "@/zod/appointment.validation";

// public endpoint: input unknown। কে book করতে পারবে (শুধু PATIENT) সেটা backend checkAuth ঠিক করে।
export async function bookAppointmentAction(
	payload: unknown,
	paymentMode: unknown,
): Promise<ActionResult<IBookAppointmentResult>> {
	const parsedPayload = bookAppointmentPayloadSchema.safeParse(payload);
	if (!parsedPayload.success) {
		return { success: false, message: parsedPayload.error.issues[0]?.message ?? "Invalid input" };
	}

	const parsedMode = paymentModeSchema.safeParse(paymentMode);
	if (!parsedMode.success) {
		return { success: false, message: "Invalid payment option" };
	}

	try {
		return parsedMode.data === "pay-now"
			? await bookAppointment(parsedPayload.data)
			: await bookAppointmentWithPayLater(parsedPayload.data);
	} catch (error) {
		return { success: false, message: getActionErrorMessage(error, "bookAppointmentAction") };
	}
}
