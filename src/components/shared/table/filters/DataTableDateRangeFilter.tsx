"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarRange } from "lucide-react";
import { type FormEvent, useId, useState } from "react";

interface DateRange {
	from?: string; // "YYYY-MM-DD"
	to?: string;
}

interface DataTableDateRangeFilterProps extends DateRange {
	label: string;
	onChange: (range: DateRange) => void;
}

export default function DataTableDateRangeFilter({ label, from, to, onChange }: DataTableDateRangeFilterProps) {
	const id = useId();
	const [open, setOpen] = useState(false);
	const [draftFrom, setDraftFrom] = useState(from ?? "");
	const [draftTo, setDraftTo] = useState(to ?? "");

	// popover খোলার সময় URL-এর বর্তমান মান দিয়ে শুরু
	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) {
			setDraftFrom(from ?? "");
			setDraftTo(to ?? "");
		}
		setOpen(nextOpen);
	};

	// "YYYY-MM-DD" string compare-ই যথেষ্ট
	const isInvalid = draftFrom !== "" && draftTo !== "" && draftTo < draftFrom;
	const isActive = Boolean(from || to);

	const handleSubmit = (event: FormEvent) => {
		event.preventDefault();
		if (isInvalid) return;
		onChange({ from: draftFrom || undefined, to: draftTo || undefined });
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>
				<Button variant="outline" className="border-dashed">
					<CalendarRange />
					{label}
					{isActive && (
						<Badge variant="secondary" className="tabular-nums">
							{from ?? "…"} → {to ?? "…"}
						</Badge>
					)}
				</Button>
			</PopoverTrigger>

			<PopoverContent align="start" className="w-72">
				<form onSubmit={handleSubmit} className="space-y-3">
					<div className="grid grid-cols-2 gap-2">
						<div className="space-y-1">
							<Label htmlFor={`${id}-from`}>From</Label>
							<Input
								id={`${id}-from`}
								type="date"
								max={draftTo || undefined}
								value={draftFrom}
								onChange={(event) => setDraftFrom(event.target.value)}
							/>
						</div>
						<div className="space-y-1">
							<Label htmlFor={`${id}-to`}>To</Label>
							<Input
								id={`${id}-to`}
								type="date"
								min={draftFrom || undefined}
								value={draftTo}
								onChange={(event) => setDraftTo(event.target.value)}
							/>
						</div>
					</div>

					{isInvalid && (
						<p className="text-xs text-destructive">&quot;To&quot; can&apos;t be before &quot;From&quot;.</p>
					)}

					<div className="flex justify-end gap-2">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => {
								onChange({});
								setOpen(false);
							}}
						>
							Clear
						</Button>
						<Button type="submit" size="sm" disabled={isInvalid}>
							Apply
						</Button>
					</div>
				</form>
			</PopoverContent>
		</Popover>
	);
}
