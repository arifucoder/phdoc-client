"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ListFilter } from "lucide-react";
import type { FilterOption } from "./DataTableSelectFilter";

interface DataTableMultiSelectFilterProps {
	label: string;
	values: string[];
	options: FilterOption[];
	onChange: (values: string[]) => void;
}

export default function DataTableMultiSelectFilter({
	label,
	values,
	options,
	onChange,
}: DataTableMultiSelectFilterProps) {
	const selected = new Set(values);

	const toggle = (value: string) => {
		const next = new Set(selected);
		if (next.has(value)) next.delete(value);
		else next.add(value);
		onChange([...next]);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" className="border-dashed">
					<ListFilter />
					{label}
					{selected.size > 0 && <Badge variant="secondary">{selected.size}</Badge>}
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="start" className="max-h-72 w-56 overflow-y-auto">
				{options.length === 0 ? (
					<p className="px-2 py-1.5 text-sm text-muted-foreground">No options</p>
				) : (
					options.map((option) => (
						<DropdownMenuCheckboxItem
							key={option.value}
							checked={selected.has(option.value)}
							onCheckedChange={() => toggle(option.value)}
							onSelect={(event) => event.preventDefault()} // একাধিক বাছতে menu খোলা থাকে
						>
							{option.label}
						</DropdownMenuCheckboxItem>
					))
				)}

				{selected.size > 0 && (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuItem onSelect={() => onChange([])} className="justify-center">
							Clear
						</DropdownMenuItem>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
