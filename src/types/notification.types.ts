export type NotificationType = "appointment" | "schedule" | "system" | "user";

// API-র মতো করে: তারিখ ISO string (JSON-এ Date object আসে না)
export interface INotification {
	id: string;
	title: string;
	message: string;
	type: NotificationType;
	createdAt: string;
	read: boolean;
}
