import * as z from "zod";

export const loginZodSchema = z.object({
	email: z.string("Email is required").trim().toLowerCase().pipe(z.email("Invalid email address")),
	password: z.string("Password is required").min(1, "Password is required").min(6, "Password must be 6 character long"),
});

export type ILoginPayload = z.infer<typeof loginZodSchema>;
