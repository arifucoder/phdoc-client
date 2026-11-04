import { LoaderCircle } from "lucide-react";

export default function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
			<LoaderCircle className="size-8 animate-spin text-primary" />
			<p className="text-sm text-muted-foreground">{text}</p>
		</div>
	);
}
