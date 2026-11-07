"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AppointmentStatus, PieChartData } from "@/types/dashboard.types";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

// রং status-এর সাথে বাঁধা, array-র ক্রমের সাথে না।
// ক্রম বা সংখ্যা বদলালেও "Completed" সবসময় একই রঙে থাকে।
const STATUS_CONFIG: Record<AppointmentStatus, { label: string; color: string }> = {
	SCHEDULED: { label: "Scheduled", color: "var(--chart-1)" },
	INPROGRESS: { label: "In Progress", color: "var(--chart-2)" },
	COMPLETED: { label: "Completed", color: "var(--chart-3)" },
	CANCELED: { label: "Canceled", color: "var(--chart-4)" },
};

// locale fixed: server আর browser-এ একই output
const numberFormatter = new Intl.NumberFormat("en-US");
const percentFormatter = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 });

interface ChartItem {
	name: string;
	value: number;
	fill: string; // recharts প্রতিটা slice-এ এই রং নিজেই বসায়
}

interface AppointmentPieChartProps {
	data: PieChartData[];
	title?: string;
	description?: string;
	className?: string;
}

export default function AppointmentPieChart({
	data,
	title = "Appointment Status",
	description = "Distribution of appointments by status",
	className,
}: AppointmentPieChartProps) {
	const total = data.reduce((sum, item) => sum + item.count, 0);

	// 0-এর slice আঁকার কিছু নেই; তবে নিচের তালিকায় সব status দেখাবে
	const chartData: ChartItem[] = data
		.filter((item) => item.count > 0)
		.map((item) => ({
			name: STATUS_CONFIG[item.status].label,
			value: item.count,
			fill: STATUS_CONFIG[item.status].color,
		}));

	// screen reader-এর জন্য chart-এর লিখিত বিবরণ
	const summary = data.map((item) => `${STATUS_CONFIG[item.status].label}: ${item.count}`).join(", ");

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>

			<CardContent>
				{total === 0 ? (
					<div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
						No appointment data available yet.
					</div>
				) : (
					<div className="grid items-center gap-6 sm:grid-cols-[1fr_auto]">
						{/* Donut + মাঝখানে মোট সংখ্যা */}
						<div className="relative h-64" role="img" aria-label={`Appointment status. Total ${total}. ${summary}`}>
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={chartData}
										dataKey="value"
										nameKey="name"
										innerRadius="62%"
										outerRadius="90%"
										stroke="var(--card)" // slice-এর মাঝে card-রঙের ফাঁক
										strokeWidth={2}
									/>
									<Tooltip
										cursor={false}
										content={({ active, payload }) => {
											const item = payload?.[0]?.payload as ChartItem | undefined;
											if (!active || !item) return null;

											return (
												<div className="rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
													<div className="flex items-center gap-2">
														<span className="size-2.5 rounded-sm" style={{ backgroundColor: item.fill }} />
														<span className="font-medium">{item.name}</span>
													</div>
													<p className="mt-1 tabular-nums text-muted-foreground">
														{numberFormatter.format(item.value)} ({percentFormatter.format(item.value / total)})
													</p>
												</div>
											);
										}}
									/>
								</PieChart>
							</ResponsiveContainer>

							<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
								<span className="text-2xl font-bold tabular-nums">{numberFormatter.format(total)}</span>
								<span className="text-xs text-muted-foreground">Total</span>
							</div>
						</div>

						{/* Legend + আসল সংখ্যা: শুধু রং দেখে না, লেখা পড়েও বোঝা যায় */}
						<ul className="min-w-48 space-y-2 text-sm">
							{data.map((item) => {
								const config = STATUS_CONFIG[item.status];

								return (
									<li key={item.status} className="flex items-center gap-3">
										<span
											aria-hidden
											className="size-3 shrink-0 rounded-sm"
											style={{ backgroundColor: config.color }}
										/>
										<span className="flex-1 text-muted-foreground">{config.label}</span>
										<span className="font-medium tabular-nums">{numberFormatter.format(item.count)}</span>
										<span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
											{percentFormatter.format(item.count / total)}
										</span>
									</li>
								);
							})}
						</ul>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

// data load হওয়ার সময়
export function AppointmentPieChartSkeleton({ className }: { className?: string }) {
	return (
		<Card className={className}>
			<CardHeader>
				<Skeleton className="h-5 w-40" />
				<Skeleton className="h-4 w-56" />
			</CardHeader>
			<CardContent className="grid items-center gap-6 sm:grid-cols-[1fr_auto]">
				<Skeleton className="mx-auto size-56 rounded-full" />
				<div className="min-w-48 space-y-3">
					{Array.from({ length: 4 }, (_, index) => (
						<Skeleton key={index} className="h-4 w-full" />
					))}
				</div>
			</CardContent>
		</Card>
	);
}
