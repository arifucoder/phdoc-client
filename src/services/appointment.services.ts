"use server";

import { httpClient } from "@/lib/axios/httpClient";
import type { IBookAppointmentPayload, IBookAppointmentResult } from "@/types/appointment.types";

// দুটোই checkAuth(PATIENT)। slot booked থাকলে backend 409 দেয়।

// appointment + Stripe checkout URL
export const bookAppointment = async (payload: IBookAppointmentPayload) =>
	httpClient.post<IBookAppointmentResult>("/appointments/book-appointment", payload);

// appointment UNPAID থাকে, ৩০ মিনিটের মধ্যে pay না করলে cron cancel করে
export const bookAppointmentWithPayLater = async (payload: IBookAppointmentPayload) =>
	httpClient.post<IBookAppointmentResult>("/appointments/book-appointment-with-pay-later", payload);
