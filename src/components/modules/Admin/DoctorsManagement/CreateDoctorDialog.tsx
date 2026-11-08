"use client";

import { createDoctorAction } from "@/actions/doctor.actions";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useActionMutation } from "@/hooks/useActionMutation";
import { DOCTORS_QUERY_KEY } from "@/queries/doctor.queries";
import type { ICreateDoctorPayload } from "@/types/doctor.types";
import type { DoctorFormValues } from "@/zod/doctor.validation";
import { Plus } from "lucide-react";
import { useState } from "react";
import DoctorForm from "./DoctorForm";
import { EMPTY_DOCTOR_FORM, toCreateDoctorPayload } from "./doctorForm.utils";

export default function CreateDoctorDialog() {
	const [open, setOpen] = useState(false);

	const { mutate, isPending } = useActionMutation({
		action: (payload: ICreateDoctorPayload) => createDoctorAction(payload),
		invalidateKey: DOCTORS_QUERY_KEY,
		successMessage: "Doctor account created",
		onSuccess: () => setOpen(false), // dialog বন্ধ হলে form unmount হয় → পরের বার ফাঁকা form
	});

	const handleSubmit = (values: DoctorFormValues) => mutate(toCreateDoctorPayload(values));

	return (
		// save চলার সময় Esc বা বাইরে click করে বন্ধ করা যাবে না
		<Dialog open={open} onOpenChange={(next) => !isPending && setOpen(next)}>
			<DialogTrigger asChild>
				<Button>
					<Plus />
					Add doctor
				</Button>
			</DialogTrigger>

			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Add doctor</DialogTitle>
					<DialogDescription>Create a doctor account. They can log in with this email and password.</DialogDescription>
				</DialogHeader>

				<DoctorForm
					mode="create"
					defaultValues={EMPTY_DOCTOR_FORM}
					onSubmit={handleSubmit}
					onCancel={() => setOpen(false)}
					isPending={isPending}
					submitLabel="Create doctor"
					pendingLabel="Creating..."
				/>
			</DialogContent>
		</Dialog>
	);
}
