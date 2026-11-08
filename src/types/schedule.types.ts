// backend scheduleIncludeConfig অনুযায়ী: doctorSchedules → doctor (appointments include হয় না)
export interface IScheduleDoctor {
	id: string;
	name: string;
	email: string;
	profilePhoto?: string | null;
}

export interface IDoctorScheduleLink {
	doctorId: string;
	scheduleId: string;
	isBooked: boolean;
	doctor: IScheduleDoctor;
}

export interface ISchedule {
	id: string;
	startDateTime: string;
	endDateTime: string;
	createdAt: string;
	updatedAt: string;
	doctorSchedules?: IDoctorScheduleLink[]; // ?include=doctorSchedules দিলে তবেই আসে
}

// backend create আর update দুটোই একই ৪টা field নেয়
export interface ISchedulePayload {
	startDate: string; // "YYYY-MM-DD"
	endDate: string;
	startTime: string; // "HH:mm"
	endTime: string;
}
