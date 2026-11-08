"use client";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AnyFieldApi } from "@tanstack/react-form";

interface AppSelectFieldProps {
	field: AnyFieldApi;
	label: string;
	options: Array<{ label: string; value: string }>;
	placeholder?: string;
}

export default function AppSelectField({ field, label, options, placeholder = "Select..." }: AppSelectFieldProps) {
	const { meta } = field.state;

	// AppField-এর মতো: field ছেড়ে গেলে বা submit চাপলে তবেই error দেখায়
	const showError = !meta.isValid && (meta.isBlurred || field.form.state.submissionAttempts > 0);
	const errorId = `${field.name}-error`;

	return (
		<Field data-invalid={showError}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>

			<Select
				name={field.name}
				value={field.state.value ?? ""}
				onValueChange={(value) => field.handleChange(value)}
				onOpenChange={(open) => {
					if (!open) field.handleBlur(); // menu বন্ধ হলে "blurred" ধরা হয়
				}}
			>
				<SelectTrigger
					id={field.name}
					className="w-full"
					aria-invalid={showError}
					aria-describedby={showError ? errorId : undefined}
				>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			{showError && <FieldError id={errorId} errors={meta.errors} />}
		</Field>
	);
}
