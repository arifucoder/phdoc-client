"use client";

import { updateDoctorAction } from "@/actions/doctor.actions";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useActionMutation } from "@/hooks/useActionMutation";
import { DOCTORS_QUERY_KEY } from "@/queries/doctor.queries";
import type { IDoctor, IUpdateDoctorPayload } from "@/types/doctor.types";
import type { DoctorFormValues } from "@/zod/doctor.validation";
import { useMemo } from "react";
import { toast } from "sonner";
import DoctorForm from "./DoctorForm";
import { doctorToFormValues, getChangedFields, toDoctorProfilePayload } from "./doctorForm.utils";

interface EditDoctorDialogProps {
	row: IDoctor | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function EditDoctorDialog({ row: doctor, open, onOpenChange }: EditDoctorDialogProps) {
	const { mutate, isPending } = useActionMutation({
		action: ({ id, payload }: { id: string; payload: IUpdateDoctorPayload }) => updateDoctorAction(id, payload),
		invalidateKey: DOCTORS_QUERY_KEY,
		successMessage: (updated) => `${updated.name}'s profile has been updated`,
		onSuccess: () => onOpenChange(false),
	});

	// useMemo: প্রতি render-এ নতুন object দিলে form নিজেকে reset করতে পারে
	const defaultValues = useMemo(() => (doctor ? doctorToFormValues(doctor) : null), [doctor]);

	const handleSubmit = (values: DoctorFormValues) => {
		if (!doctor || !defaultValues) return;

		// দুই দিকই একই নিয়মে বদলে তুলনা করা, তাই null বনাম "" বা "500" বনাম 500 ভুলভাবে "বদলেছে" ধরে না
		const changes = getChangedFields(toDoctorProfilePayload(values), toDoctorProfilePayload(defaultValues));

		if (Object.keys(changes).length === 0) {
			toast.info("No changes to save");
			return;
		}

		mutate({ id: doctor.id, payload: { doctor: changes } });
	};

	return (
		// save চলার সময় Esc বা বাইরে click করে বন্ধ করা যাবে না
		<Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Edit doctor</DialogTitle>
					<DialogDescription>
						Update {doctor?.name}&apos;s profile. Email, registration number and specialties can&apos;t be changed here.
					</DialogDescription>
				</DialogHeader>

				{doctor && defaultValues && (
					// key: অন্য doctor খুললে form একদম নতুন করে শুরু হয়
					<DoctorForm
						key={doctor.id}
						mode="edit"
						defaultValues={defaultValues}
						onSubmit={handleSubmit}
						onCancel={() => onOpenChange(false)}
						isPending={isPending}
						submitLabel="Save changes"
						pendingLabel="Saving..."
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}
