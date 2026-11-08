"use client";

import { deleteDoctorAction } from "@/actions/doctor.actions";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useActionMutation } from "@/hooks/useActionMutation";
import { DOCTORS_QUERY_KEY } from "@/queries/doctor.queries";
import type { IDoctor } from "@/types/doctor.types";
import { LoaderCircle, Trash2 } from "lucide-react";

interface DeleteDoctorDialogProps {
	row: IDoctor | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function DeleteDoctorDialog({ row: doctor, open, onOpenChange }: DeleteDoctorDialogProps) {
	const { mutate, isPending } = useActionMutation({
		action: deleteDoctorAction,
		invalidateKey: DOCTORS_QUERY_KEY,
		successMessage: `${doctor?.name ?? "Doctor"} has been deleted`,
		onSuccess: () => onOpenChange(false),
	});

	return (
		// delete চলার সময় Esc বা বাইরে click করে বন্ধ করা যাবে না
		<AlertDialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete this doctor?</AlertDialogTitle>
					<AlertDialogDescription>
						<strong className="text-foreground">{doctor?.name}</strong> will be removed and can no longer log in. Their
						past appointments and prescriptions stay in the records.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
					{/* AlertDialogAction না: ওটা click করলেই dialog বন্ধ করে দেয়, delete শেষ হওয়ার আগেই */}
					<Button variant="destructive" disabled={isPending || !doctor} onClick={() => doctor && mutate(doctor.id)}>
						{isPending ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
						{isPending ? "Deleting..." : "Delete"}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
