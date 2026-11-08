"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SlidersHorizontal } from "lucide-react";
import { type FormEvent, useId, useState } from "react";

interface Range {
	min?: string;
	max?: string;
}

interface DataTableRangeFilterProps extends Range {
	label: string;
	onChange: (range: Range) => void;
}

export default function DataTableRangeFilter({ label, min, max, onChange }: DataTableRangeFilterProps) {
	const id = useId();
	const [open, setOpen] = useState(false);
	const [draftMin, setDraftMin] = useState(min ?? "");
	const [draftMax, setDraftMax] = useState(max ?? "");

	// popover খোলার সময় URL-এর বর্তমান মান দিয়ে শুরু
	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) {
			setDraftMin(min ?? "");
			setDraftMax(max ?? "");
		}
		setOpen(nextOpen);
	};

	const isInvalid = draftMin !== "" && draftMax !== "" && Number(draftMin) > Number(draftMax);
	const isActive = Boolean(min || max);

	// Apply চাপলে তবেই URL বদলায় (টাইপ করার সময় প্রতি অক্ষরে API call হয় না)
	const handleSubmit = (event: FormEvent) => {
		event.preventDefault();
		if (isInvalid) return;
		onChange({ min: draftMin || undefined, max: draftMax || undefined });
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>
				<Button variant="outline" className="border-dashed">
					<SlidersHorizontal />
					{label}
					{isActive && (
						<Badge variant="secondary" className="tabular-nums">
							{min ?? "0"}–{max ?? "∞"}
						</Badge>
					)}
				</Button>
			</PopoverTrigger>

			<PopoverContent align="start" className="w-64">
				<form onSubmit={handleSubmit} className="space-y-3">
					<div className="grid grid-cols-2 gap-2">
						<div className="space-y-1">
							<Label htmlFor={`${id}-min`}>Min</Label>
							<Input
								id={`${id}-min`}
								type="number"
								inputMode="numeric"
								min={0}
								value={draftMin}
								onChange={(event) => setDraftMin(event.target.value)}
							/>
						</div>
						<div className="space-y-1">
							<Label htmlFor={`${id}-max`}>Max</Label>
							<Input
								id={`${id}-max`}
								type="number"
								inputMode="numeric"
								min={0}
								value={draftMax}
								onChange={(event) => setDraftMax(event.target.value)}
							/>
						</div>
					</div>

					{isInvalid && <p className="text-xs text-destructive">Min can&apos;t be greater than max.</p>}

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
