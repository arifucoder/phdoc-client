import type { ISchedule } from "./schedule.types";

// backend getMyDoctorSchedules → include { schedule: true }
export interface IDoctorSchedule {
	doctorId: string;
	scheduleId: string;
	isBooked: boolean;
	createdAt: string;
	updatedAt: string;
	schedule: Omit<ISchedule, "doctorSchedules">;
}

export interface ICreateDoctorSchedulePayload {
	scheduleIds: string[];
}

// public available route: রোগীর শুধু সময়টুকু লাগে
export interface IAvailableSlot {
	id: string; // scheduleId
	startDateTime: string;
	endDateTime: string;
}
