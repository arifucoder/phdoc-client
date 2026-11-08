// backend prisma enum Gender-এর সাথে মিল (OTHER নেই)
export type Gender = "MALE" | "FEMALE";

// backend doctorInclude (user + specialties) অনুযায়ী
export interface IDoctor {
	id: string;
	name: string;
	email: string;
	profilePhoto?: string | null;
	contactNumber?: string | null;
	registrationNumber: string;
	gender: Gender;
	address?: string | null;
	appointmentFee: number;
	qualification: string;
	designation: string;
	currentWorkingPlace: string;
	experience: number;
	averageRating: number;
	createdAt: string;
	specialties: Array<{
		specialty: { id: string; title: string };
	}>;
}

// create আর edit দুজনেরই কমন profile field (backend schema অনুযায়ী)
export interface IDoctorProfilePayload {
	name: string;
	contactNumber: string;
	address?: string;
	profilePhoto?: string; // শুধু edit-এ (backend create-এ নেয় না)
	gender: Gender;
	experience: number;
	appointmentFee: number;
	qualification: string;
	designation: string;
	currentWorkingPlace: string;
}

// backend PATCH /doctors/:id → { doctor: {...} }, শুধু যা বদলেছে
export interface IUpdateDoctorPayload {
	doctor: Partial<IDoctorProfilePayload>;
}

// backend POST /user/create-doctor
export interface ICreateDoctorPayload {
	password: string;
	doctor: Omit<IDoctorProfilePayload, "profilePhoto"> & {
		email: string;
		registrationNumber: string;
	};
	specialties: string[]; // specialty id (uuid)
}
