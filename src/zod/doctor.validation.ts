import * as z from "zod";

const BD_PHONE_REGEX = /^(\+?880|0)1[3-9]\d{8}$/;

// =============== Form schema (browser) ===============
// input field string দেয়, তাই মানগুলো string হিসেবে যাচাই হয়। optional field-এ "" = দেওয়া হয়নি।

const requiredText = (label: string, min: number, max: number) =>
	z
		.string()
		.trim()
		.min(1, `${label} is required`)
		.min(min, `${label} must be at least ${min} characters`)
		.max(max, `${label} must be at most ${max} characters`);

// create আর edit দুজনেরই কমন অংশ
const doctorProfileFormShape = {
	name: requiredText("Name", 3, 30),
	contactNumber: z.string().trim().regex(BD_PHONE_REGEX, "Enter a valid Bangladeshi phone number (01XXXXXXXXX)"),
	gender: z.union([z.enum(["MALE", "FEMALE"]), z.literal("")]).refine((value) => value !== "", "Select a gender"),
	designation: requiredText("Designation", 2, 50),
	currentWorkingPlace: requiredText("Working place", 2, 50),
	qualification: requiredText("Qualification", 2, 50),
	experience: z.string().trim().regex(/^\d+$/, "Experience must be a whole number (years)"),
	appointmentFee: z
		.string()
		.trim()
		.regex(/^\d+(\.\d{1,2})?$/, "Fee must be a positive number"),
	address: z.union([
		z.literal(""),
		z
			.string()
			.trim()
			.min(10, "Address must be at least 10 characters")
			.max(100, "Address must be at most 100 characters"),
	]),
	profilePhoto: z.union([z.literal(""), z.url({ protocol: /^https?$/, error: "Must be a valid http/https URL" })]),
};

// Create: account-এর field-গুলোও যাচাই হয় (backend createDoctorValidationSchema অনুযায়ী)
export const createDoctorFormSchema = z.object({
	...doctorProfileFormShape,
	email: z.string().trim().min(1, "Email is required").pipe(z.email("Invalid email address")),
	password: z
		.string()
		.min(6, "Password must be at least 6 characters")
		.max(32, "Password must be at most 32 characters"),
	registrationNumber: z.string().trim().min(1, "Registration number is required").max(50, "Too long"),
	specialties: z.array(z.string()).min(1, "Select at least one specialty"),
});

// Edit: account-এর field form-এ থাকে (একই form, একই type), কিন্তু বদলানো যায় না, তাই যাচাইও নেই
export const editDoctorFormSchema = z.object({
	...doctorProfileFormShape,
	email: z.string(),
	password: z.string(),
	registrationNumber: z.string(),
	specialties: z.array(z.string()),
});

// দুই schema-র input type একই, তাই একটাই form type
export type DoctorFormValues = z.input<typeof createDoctorFormSchema>;

// =============== Server schema (server action) ===============
// Server Action public endpoint, তাই আসল type আবার যাচাই হয়।
// z.object অজানা key বাদ দেয়: কেউ averageRating বা isDeleted পাঠালেও backend-এ যাবে না।

const doctorProfilePayloadSchema = z.object({
	name: z.string().trim().min(3).max(30),
	contactNumber: z.string().trim().regex(BD_PHONE_REGEX, "Invalid Bangladeshi phone number"),
	address: z.string().trim().min(10).max(100).optional(),
	profilePhoto: z.url({ protocol: /^https?$/ }).optional(),
	gender: z.enum(["MALE", "FEMALE"]),
	experience: z.int().nonnegative(),
	appointmentFee: z.number().nonnegative(),
	qualification: z.string().trim().min(2).max(50),
	designation: z.string().trim().min(2).max(50),
	currentWorkingPlace: z.string().trim().min(2).max(50),
});

export const updateDoctorPayloadSchema = z.object({
	doctor: doctorProfilePayloadSchema.partial().refine((doctor) => Object.keys(doctor).length > 0, "Nothing to update"),
});

export const createDoctorPayloadSchema = z.object({
	password: z
		.string()
		.min(6, "Password must be at least 6 characters")
		.max(32, "Password must be at most 32 characters"),
	doctor: doctorProfilePayloadSchema.omit({ profilePhoto: true }).extend({
		email: z.email("Invalid email address").toLowerCase(),
		registrationNumber: z.string().trim().min(1, "Registration number is required"),
	}),
	specialties: z
		.array(z.uuid("Invalid specialty"))
		.min(1, "Select at least one specialty")
		.refine((ids) => new Set(ids).size === ids.length, "Duplicate specialties are not allowed"),
});
