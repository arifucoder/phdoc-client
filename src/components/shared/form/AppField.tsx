import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { AnyFieldApi } from "@tanstack/react-form";
import type { ComponentProps, ReactNode } from "react";

type AppFieldProps = Omit<
	ComponentProps<typeof Input>,
	"id" | "name" | "value" | "defaultValue" | "onChange" | "onBlur"
> & {
	field: AnyFieldApi;
	label: string;
	endAdornment?: ReactNode;
};

export default function AppField({ field, label, endAdornment, className, ...inputProps }: AppFieldProps) {
	const { meta } = field.state;

	// field থেকে বের হওয়ার পর বা submit চাপার পর error দেখাও, টাইপ করার সময় না
	const showError = !meta.isValid && (meta.isBlurred || field.form.state.submissionAttempts > 0);
	const errorId = `${field.name}-error`;

	return (
		<Field data-invalid={showError}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>

			<div className="relative">
				<Input
					{...inputProps}
					id={field.name}
					name={field.name}
					value={field.state.value ?? ""}
					onChange={(e) => field.handleChange(e.target.value)}
					onBlur={field.handleBlur}
					aria-invalid={showError}
					aria-describedby={showError ? errorId : undefined}
					className={cn(endAdornment && "pr-10", className)}
				/>

				{endAdornment && <div className="absolute inset-y-0 right-0 flex items-center pr-1">{endAdornment}</div>}
			</div>

			{showError && <FieldError id={errorId} errors={meta.errors} />}
		</Field>
	);
}
