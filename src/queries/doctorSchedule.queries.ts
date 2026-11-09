import { getAvailableDoctorSlots, getMyDoctorSchedules } from "@/services/doctorSchedule.services";
import { queryOptions } from "@tanstack/react-query";

// invalidate করলে table আর "Add slots" dialog-এর day-query দুটোই আবার আসে
export const MY_DOCTOR_SCHEDULES_QUERY_KEY = ["my-doctor-schedules"] as const;

export const myDoctorSchedulesQueryOptions = (queryString: string) =>
	queryOptions({
		queryKey: [...MY_DOCTOR_SCHEDULES_QUERY_KEY, queryString],
		queryFn: () => getMyDoctorSchedules(queryString),
		// রোগী book করলে isBooked বদলায় (doctor invalidate করে না), তাই ছোট রাখা
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 30,
	});

// book হলে invalidate → booked slot তালিকা থেকে সরে যায়
export const AVAILABLE_SLOTS_QUERY_KEY = ["available-slots"] as const;

export const availableSlotsQueryOptions = (doctorId: string, startDate: string, endDate: string) =>
	queryOptions({
		queryKey: [...AVAILABLE_SLOTS_QUERY_KEY, doctorId, startDate, endDate],
		queryFn: () => getAvailableDoctorSlots(doctorId, startDate, endDate),
		staleTime: 1000 * 30, // অন্য রোগী যেকোনো সময় book করতে পারে, তাই ছোট
	});
