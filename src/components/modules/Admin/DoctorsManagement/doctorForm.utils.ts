import type { ICreateDoctorPayload, IDoctor, IDoctorProfilePayload } from "@/types/doctor.types";
import type { DoctorFormValues } from "@/zod/doctor.validation";

// Create form-এর শুরুর ফাঁকা মান
export const EMPTY_DOCTOR_FORM: DoctorFormValues = {
	email: "",
	password: "",
	registrationNumber: "",
	specialties: [],
	name: "",
	contactNumber: "",
	gender: "",
	designation: "",
	currentWorkingPlace: "",
	qualification: "",
	experience: "",
	appointmentFee: "",
	address: "",
	profilePhoto: "",
};

// table-এর row → form-এর string মান (null হলে "")
export const doctorToFormValues = (doctor: IDoctor): DoctorFormValues => ({
	email: doctor.email,
	password: "",
	registrationNumber: doctor.registrationNumber,
	specialties: doctor.specialties.map(({ specialty }) => specialty.id),
	name: doctor.name,
	contactNumber: doctor.contactNumber ?? "",
	gender: doctor.gender,
	designation: doctor.designation,
	currentWorkingPlace: doctor.currentWorkingPlace,
	qualification: doctor.qualification,
	experience: String(doctor.experience),
	appointmentFee: String(doctor.appointmentFee),
	address: doctor.address ?? "",
	profilePhoto: doctor.profilePhoto ?? "",
});

// form-এর string → backend-এর আসল type ("" হলে পাঠাই না)
export const toDoctorProfilePayload = (values: DoctorFormValues): IDoctorProfilePayload => {
	// schema আগেই "" আটকায়; এই লাইন শুধু TypeScript-কে নিশ্চিত করে
	if (values.gender === "") throw new Error("Gender is required");

	return {
		name: values.name.trim(),
		contactNumber: values.contactNumber.trim(),
		gender: values.gender,
		designation: values.designation.trim(),
		currentWorkingPlace: values.currentWorkingPlace.trim(),
		qualification: values.qualification.trim(),
		experience: Number(values.experience),
		appointmentFee: Number(values.appointmentFee),
		address: values.address.trim() || undefined,
		profilePhoto: values.profilePhoto.trim() || undefined,
	};
};

// Create: backend-এর { password, doctor, specialties } আকারে
export const toCreateDoctorPayload = (values: DoctorFormValues): ICreateDoctorPayload => {
	// backend create-এ profilePhoto নেয় না, তাই বাদ
	const { profilePhoto: _profilePhoto, ...profile } = toDoctorProfilePayload(values);

	return {
		password: values.password,
		doctor: {
			...profile,
			email: values.email.trim().toLowerCase(),
			registrationNumber: values.registrationNumber.trim(),
		},
		specialties: values.specialties,
	};
};

// Edit: শুধু যে field-গুলো বদলেছে (PATCH-এ সব পাঠানোর দরকার নেই)
export const getChangedFields = <T extends object>(next: T, previous: T): Partial<T> =>
	Object.fromEntries(
		Object.entries(next).filter(([key, value]) => value !== undefined && value !== previous[key as keyof T]),
	) as Partial<T>;
