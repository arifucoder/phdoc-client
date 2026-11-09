import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface StarRatingProps {
	value: number; // 0–5
	className?: string;
}

// screen reader পুরোটা একবারে পড়ে ("4.5 out of 5"), ৫টা আলাদা icon না
export default function StarRating({ value, className }: StarRatingProps) {
	const filled = Math.round(value);

	return (
		<span role="img" aria-label={`${value.toFixed(1)} out of 5`} className={cn("inline-flex gap-0.5", className)}>
			{[1, 2, 3, 4, 5].map((star) => (
				<Star
					key={star}
					aria-hidden
					className={cn(
						"size-4",
						star <= filled ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/30",
					)}
				/>
			))}
		</span>
	);
}
