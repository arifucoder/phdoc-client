import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";

type AppSubmitButtonProps = Omit<ComponentProps<typeof Button>, "type"> & {
	isPending: boolean;
	pendingLabel?: ReactNode;
};

export default function AppSubmitButton({
	isPending,
	pendingLabel,
	disabled,
	children,
	className,
	...props
}: AppSubmitButtonProps) {
	return (
		<Button
			{...props}
			type="submit"
			disabled={disabled || isPending}
			aria-busy={isPending}
			className={cn("w-full", className)}
		>
			{isPending && <Spinner aria-hidden="true" />}
			{isPending ? (pendingLabel ?? children) : children}
		</Button>
	);
}
