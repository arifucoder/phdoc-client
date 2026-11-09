"use client";

import AppField from "@/components/shared/form/AppField";
import AppMultiSelectField from "@/components/shared/form/AppMultiSelectField";
import AppSelectField from "@/components/shared/form/AppSelectField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { specialtiesQueryOptions } from "@/queries/specialty.queries";
import { createDoctorFormSchema, type DoctorFormValues, editDoctorFormSchema } from "@/zod/doctor.validation";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { useMemo, useState } from "react";
import type * as z from "zod";
import { GENDER_OPTIONS } from "./doctorsTable.config";

interface DoctorFormProps {
	mode: "create" | "edit";
	defaultValues: DoctorFormValues;
	onSubmit: (values: DoctorFormValues) => void;
	onCancel: () => void;
	isPending: boolean;
	submitLabel: string;
	pendingLabel: string;
}

export default function DoctorForm({
	mode,
	defaultValues,
	onSubmit,
	onCancel,
	isPending,
	submitLabel,
	pendingLabel,
}: DoctorFormProps) {
	const isCreate = mode === "create";
	const [showPassword, setShowPassword] = useState(false);

	// table page-এ আগেই cache-এ আছে, তাই নতুন request যায় না
	const { data: specialtiesResponse } = useQuery({ ...specialtiesQueryOptions(), enabled: isCreate });
	const specialtyOptions = useMemo(
		() => (specialtiesResponse?.data ?? []).map((specialty) => ({ label: specialty.title, value: specialty.id })),
		[specialtiesResponse],
	);

	// দুই schema-র input/output একই, তাই একটা common type-এ রাখলাম
	const formSchema: z.ZodType<DoctorFormValues, DoctorFormValues> = isCreate
		? createDoctorFormSchema
		: editDoctorFormSchema;

	const form = useForm({
		defaultValues,
		validators: { onChange: formSchema },
		onSubmit: ({ value }) => onSubmit(value),
	});

	return (
		<form
			noValidate
			className="space-y-6"
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				void form.handleSubmit();
			}}
		>
			{/* fieldset disabled: save চলার সময় সব input একসাথে বন্ধ */}
			<fieldset disabled={isPending} className="space-y-6">
				{/* ---------- Account (শুধু create) ---------- */}
				{isCreate && (
					<>
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="sm:col-span-2">
								<form.Field name="email">
									{(field) => (
										<AppField
											field={field}
											label="Email"
											type="email"
											inputMode="email"
											autoComplete="off"
											autoCapitalize="none"
											spellCheck={false}
											placeholder="doctor@example.com"
										/>
									)}
								</form.Field>
							</div>

							<form.Field name="password">
								{(field) => (
									<AppField
										field={field}
										label="Temporary password"
										type={showPassword ? "text" : "password"}
										autoComplete="new-password"
										endAdornment={
											<Button
												type="button"
												variant="ghost"
												size="icon-sm"
												onClick={() => setShowPassword((prev) => !prev)}
												aria-label={showPassword ? "Hide password" : "Show password"}
											>
												{showPassword ? <EyeOff /> : <Eye />}
											</Button>
										}
									/>
								)}
							</form.Field>

							<form.Field name="registrationNumber">
								{(field) => <AppField field={field} label="Registration no." placeholder="BMDC-12345" />}
							</form.Field>

							<div className="sm:col-span-2">
								<form.Field name="specialties">
									{(field) => (
										<AppMultiSelectField
											field={field}
											label="Specialties"
											options={specialtyOptions}
											emptyText="No specialties yet. Create a specialty first."
										/>
									)}
								</form.Field>
							</div>
						</div>

						<p className="text-xs text-muted-foreground">
							The doctor will be asked to change this password on first login.
						</p>

						<Separator />
					</>
				)}

				{/* ---------- Profile (create + edit) ---------- */}
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="sm:col-span-2">
						<form.Field name="name">
							{(field) => <AppField field={field} label="Full name" placeholder="Dr. Jane Doe" autoComplete="off" />}
						</form.Field>
					</div>

					<form.Field name="contactNumber">
						{(field) => <AppField field={field} label="Phone" type="tel" inputMode="tel" placeholder="01XXXXXXXXX" />}
					</form.Field>

					<form.Field name="gender">
						{(field) => (
							<AppSelectField field={field} label="Gender" options={GENDER_OPTIONS} placeholder="Select gender" />
						)}
					</form.Field>

					<form.Field name="designation">
						{(field) => <AppField field={field} label="Designation" placeholder="Senior Consultant" />}
					</form.Field>

					<form.Field name="currentWorkingPlace">
						{(field) => <AppField field={field} label="Working place" placeholder="Dhaka Medical College" />}
					</form.Field>

					<div className="sm:col-span-2">
						<form.Field name="qualification">
							{(field) => <AppField field={field} label="Qualification" placeholder="MBBS, FCPS (Medicine)" />}
						</form.Field>
					</div>

					<form.Field name="experience">
						{(field) => <AppField field={field} label="Experience (years)" type="number" inputMode="numeric" min={0} />}
					</form.Field>

					<form.Field name="appointmentFee">
						{(field) => (
							<AppField field={field} label="Appointment fee (৳)" type="number" inputMode="decimal" min={0} />
						)}
					</form.Field>

					<div className="sm:col-span-2">
						<form.Field name="address">{(field) => <AppField field={field} label="Address (optional)" />}</form.Field>
					</div>

					{/* backend create-এ photo নেয় না, তাই শুধু edit-এ */}
					{!isCreate && (
						<div className="sm:col-span-2">
							<form.Field name="profilePhoto">
								{(field) => (
									<AppField
										field={field}
										label="Profile photo URL (optional)"
										type="url"
										inputMode="url"
										placeholder="https://..."
									/>
								)}
							</form.Field>
						</div>
					)}
				</div>
			</fieldset>

			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
					Cancel
				</Button>
				<AppSubmitButton isPending={isPending} pendingLabel={pendingLabel} className="w-auto">
					{submitLabel}
				</AppSubmitButton>
			</div>
		</form>
	);
}
