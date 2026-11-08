"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { BarChartData } from "@/types/dashboard.types";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// timeZone: "UTC": backend মাসের শুরু UTC-তে পাঠায়।
// local সময়ে format করলে UTC-র পেছনের দেশে "Oct" দেখাত, আর server/browser-এ আলাদা হতো।
const axisMonthFormatter = new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
const fullMonthFormatter = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
const numberFormatter = new Intl.NumberFormat("en-US");

const TICK_STYLE = { fill: "var(--muted-foreground)", fontSize: 12 };

interface ChartItem {
	label: string; // axis-এ: "Nov 26"
	fullLabel: string; // tooltip-এ: "November 2026"
	appointments: number;
}

interface AppointmentBarChartProps {
	data: BarChartData[];
	title?: string;
	description?: string;
	className?: string;
}

export default function AppointmentBarChart({
	data,
	title = "Appointment Trends",
	description = "Appointments per month, last 12 months",
	className,
}: AppointmentBarChartProps) {
	const chartData: ChartItem[] = data.map((item) => {
		const date = new Date(item.month);
		return {
			label: axisMonthFormatter.format(date),
			fullLabel: fullMonthFormatter.format(date),
			appointments: item.count,
		};
	});

	const hasData = chartData.some((item) => item.appointments > 0);

	// screen reader-এর জন্য chart-এর লিখিত বিবরণ
	const summary = chartData.map((item) => `${item.fullLabel}: ${item.appointments}`).join(", ");

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>

			<CardContent>
				{!hasData ? (
					<div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
						No appointment data available yet.
					</div>
				) : (
					<div className="h-72 sm:h-80" role="img" aria-label={`Monthly appointments. ${summary}`}>
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
								{/* হালকা, শুধু অনুভূমিক grid: data-কে প্রাধান্য দেয় */}
								<CartesianGrid vertical={false} stroke="var(--border)" />

								<XAxis
									dataKey="label"
									tickLine={false}
									axisLine={false}
									tickMargin={8}
									minTickGap={8} // জায়গা কম হলে কিছু label নিজে থেকে লুকায়
									tick={TICK_STYLE}
								/>

								<YAxis
									tickLine={false}
									axisLine={false}
									allowDecimals={false} // ২.৫টা appointment হয় না
									width={32}
									tick={TICK_STYLE}
								/>

								<Tooltip
									cursor={{ fill: "var(--muted)", opacity: 0.6 }}
									content={({ active, payload }) => {
										const item = payload?.[0]?.payload as ChartItem | undefined;
										if (!active || !item) return null;

										return (
											<div className="rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
												<p className="font-medium">{item.fullLabel}</p>
												<p className="mt-1 tabular-nums text-muted-foreground">
													{numberFormatter.format(item.appointments)} appointments
												</p>
											</div>
										);
									}}
								/>

								<Bar dataKey="appointments" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={48} />
							</BarChart>
						</ResponsiveContainer>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

// skeleton-এ bar-এর উচ্চতা fixed (random দিলে server/browser-এ আলাদা হয়ে hydration mismatch হবে)
const SKELETON_BAR_HEIGHTS = ["40%", "65%", "50%", "80%", "35%", "70%", "55%", "90%", "45%", "60%", "75%", "50%"];

export function AppointmentBarChartSkeleton({ className }: { className?: string }) {
	return (
		<Card className={className}>
			<CardHeader>
				<Skeleton className="h-5 w-40" />
				<Skeleton className="h-4 w-56" />
			</CardHeader>
			<CardContent>
				<div className="flex h-72 items-end gap-2 sm:h-80">
					{SKELETON_BAR_HEIGHTS.map((height, index) => (
						<Skeleton key={index} className="flex-1 rounded-b-none" style={{ height }} />
					))}
				</div>
			</CardContent>
		</Card>
	);
}
