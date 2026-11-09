"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DoctorsPaginationProps {
	page: number;
	totalPages: number;
	disabled: boolean;
	onPageChange: (page: number) => void;
}

export default function DoctorsPagination({ page, totalPages, disabled, onPageChange }: DoctorsPaginationProps) {
	if (totalPages <= 1) return null;

	return (
		<nav aria-label="Doctors pagination" className="flex items-center justify-center gap-3">
			<Button variant="outline" disabled={disabled || page <= 1} onClick={() => onPageChange(page - 1)}>
				<ChevronLeft />
				Previous
			</Button>
			<span className="text-sm tabular-nums text-muted-foreground">
				Page {page} of {totalPages}
			</span>
			<Button variant="outline" disabled={disabled || page >= totalPages} onClick={() => onPageChange(page + 1)}>
				Next
				<ChevronRight />
			</Button>
		</nav>
	);
}
