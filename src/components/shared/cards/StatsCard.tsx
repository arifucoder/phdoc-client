import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "cn";
import type { LucideIcon } from "lucide-react";

// ⚠️ এই file-এ "use client" দেবে না।
// তাহলে Server Component থেকে icon (function) পাঠানো যাবে না।

interface StatsCardProps {
	title: string;
	value: number | string; // টাকার মতো format করা মান string হিসেবে পাঠাও
	icon: LucideIcon;
	description?: string;
	className?: string;
}

// locale fixed রাখা: server আর browser-এ একই output → hydration mismatch হয় না
const numberFormatter = new Intl.NumberFormat("en-US");

const formatValue = (value: number | string) => (typeof value === "number" ? numberFormatter.format(value) : value);

export default function StatsCard({ title, value, icon: Icon, description, className }: StatsCardProps) {
	return (
		<Card className={cn("transition-shadow hover:shadow-md", className)}>
			<CardHeader>
				<CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
				<CardAction>
					<div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
						<Icon className="size-5" aria-hidden />
					</div>
				</CardAction>
			</CardHeader>

			<CardContent className="space-y-1">
				{/* tabular-nums: সংখ্যা বদলালে width লাফায় না */}
				<p className="text-2xl font-bold tabular-nums">{formatValue(value)}</p>
				{description && <p className="text-xs text-muted-foreground">{description}</p>}
			</CardContent>
		</Card>
	);
}

// data load হওয়ার সময় "0"-এর বদলে এটা দেখাও
export function StatsCardSkeleton() {
	return (
		<Card>
			<CardHeader>
				<Skeleton className="h-4 w-24" />
				<CardAction>
					<Skeleton className="size-9 rounded-lg" />
				</CardAction>
			</CardHeader>

			<CardContent className="space-y-2">
				<Skeleton className="h-7 w-16" />
				<Skeleton className="h-3 w-32" />
			</CardContent>
		</Card>
	);
}
