"use client";

import { Button } from "@/components/ui/button";
import { FieldError, FieldLegend, FieldSet } from "@/components/ui/field";
import type { AnyFieldApi } from "@tanstack/react-form";
import { Check } from "lucide-react";

interface AppMultiSelectFieldProps {
	field: AnyFieldApi; // value: string[]
	label: string;
	options: Array<{ label: string; value: string }>;
	emptyText?: string;
}

export default function AppMultiSelectField({
	field,
	label,
	options,
	emptyText = "No options available",
}: AppMultiSelectFieldProps) {
	const selected: string[] = field.state.value ?? [];
	const { meta } = field.state;
	const showError = !meta.isValid && (meta.isTouched || field.form.state.submissionAttempts > 0);
	const errorId = `${field.name}-error`;

	const toggle = (value: string) => {
		const next = selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value];
		field.handleChange(next);
		field.handleBlur();
	};

	return (
		// fieldset + legend: পুরো বাটনের দলটার একটাই নাম (screen reader-এর জন্য)
		<FieldSet data-invalid={showError}>
			<FieldLegend className="text-sm font-medium">{label}</FieldLegend>

			{options.length === 0 ? (
				<p className="text-sm text-muted-foreground">{emptyText}</p>
			) : (
				<div className="flex flex-wrap gap-2" aria-describedby={showError ? errorId : undefined}>
					{options.map((option) => {
						const isSelected = selected.includes(option.value);

						return (
							<Button
								key={option.value}
								type="button"
								size="sm"
								variant={isSelected ? "default" : "outline"}
								aria-pressed={isSelected} // toggle বাটন: বাছাই করা কিনা screen reader বলে দেয়
								onClick={() => toggle(option.value)}
							>
								{isSelected && <Check />}
								{option.label}
							</Button>
						);
					})}
				</div>
			)}

			{showError && <FieldError id={errorId} errors={meta.errors} />}
		</FieldSet>
	);
}
