"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface FilterOption {
	label: string;
	value: string;
}

// Radix Select-এ খালি string মান দেওয়া যায় না, তাই "সব"-এর জন্য আলাদা মান
const ALL_VALUE = "__all__";

interface DataTableSelectFilterProps {
	label: string;
	allLabel: string;
	value?: string;
	options: FilterOption[];
	onChange: (value: string | undefined) => void;
}

export default function DataTableSelectFilter({
	label,
	allLabel,
	value,
	options,
	onChange,
}: DataTableSelectFilterProps) {
	return (
		<Select value={value ?? ALL_VALUE} onValueChange={(next) => onChange(next === ALL_VALUE ? undefined : next)}>
			<SelectTrigger className="w-36" aria-label={label}>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value={ALL_VALUE}>{allLabel}</SelectItem>
				{options.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
