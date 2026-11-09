export type PaymentMode = "pay-now" | "pay-later";

export interface IBookAppointmentPayload {
	doctorId: string;
	scheduleId: string;
}

// backend: pay-now → { appointment, payment, paymentUrl }, pay-later → { appointment, payment }
export interface IBookAppointmentResult {
	appointment: {
		id: string;
		status: string;
		paymentStatus: string;
	};
	paymentUrl?: string | null; // Stripe session.url null হতে পারে
}
