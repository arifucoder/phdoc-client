"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { INotification, NotificationType } from "@/types/notification.types";
import { cn } from "cn";
import { formatDistanceToNow } from "date-fns";
import { Bell, Calendar, CircleCheck, Clock, type LucideIcon, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// TODO: backend-এ notification API হলে TanStack Query দিয়ে আনবে।
// fixed তারিখ: module-এর উপরে Date.now() দিলে SSR/prerender-এ error আর hydration mismatch হয়।
const MOCK_NOTIFICATIONS: INotification[] = [
	{
		id: "1",
		title: "New Appointment Scheduled",
		message: "You have a new appointment scheduled with John Doe on 2026-11-15 at 10:00 AM.",
		type: "appointment",
		createdAt: "2026-11-07T01:00:00.000Z",
		read: false,
	},
	{
		id: "2",
		title: "Schedule Updated",
		message: "Your schedule has been updated for the week of 2026-11-17.",
		type: "schedule",
		createdAt: "2026-11-06T20:00:00.000Z",
		read: true,
	},
	{
		id: "3",
		title: "System Maintenance",
		message: "The system will undergo maintenance on 2026-11-20 from 1:00 AM to 3:00 AM.",
		type: "system",
		createdAt: "2026-11-06T01:00:00.000Z",
		read: false,
	},
	{
		id: "4",
		title: "New User Registered",
		message: "A new user, Jane Smith, has registered on the platform.",
		type: "user",
		createdAt: "2026-11-05T01:00:00.000Z",
		read: true,
	},
];

// Record: নতুন type যোগ হলে এখানে না লিখলে TypeScript error দেবে
const notificationIcons: Record<NotificationType, { icon: LucideIcon; className: string }> = {
	appointment: { icon: Calendar, className: "text-blue-600" },
	schedule: { icon: Clock, className: "text-amber-600" },
	system: { icon: CircleCheck, className: "text-purple-600" },
	user: { icon: UserPlus, className: "text-green-600" },
};

export default function NotificationDropdown() {
	const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
	const unreadCount = notifications.filter((notification) => !notification.read).length;

	const markAsRead = (id: string) =>
		setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

	const markAllAsRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="icon"
					className="relative"
					aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
				>
					<Bell />
					{unreadCount > 0 && (
						<span
							aria-hidden
							className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-white"
						>
							{unreadCount > 9 ? "9+" : unreadCount}
						</span>
					)}
				</Button>
			</DropdownMenuTrigger>

			{/* Content শুধু menu খুললেই (browser-এ) render হয়, তাই formatDistanceToNow নিরাপদ */}
			<DropdownMenuContent align="end" className="w-80">
				<DropdownMenuLabel className="flex items-center justify-between">
					<span>Notifications</span>
					{unreadCount > 0 && <Badge variant="secondary">{unreadCount} new</Badge>}
				</DropdownMenuLabel>

				<DropdownMenuSeparator />

				<div className="max-h-80 overflow-y-auto">
					{notifications.length === 0 ? (
						<p className="p-6 text-center text-sm text-muted-foreground">No notifications</p>
					) : (
						notifications.map((notification) => {
							const { icon: Icon, className } = notificationIcons[notification.type];

							return (
								<DropdownMenuItem
									key={notification.id}
									// preventDefault: click করলে menu বন্ধ না করে শুধু read করা
									onSelect={(event) => {
										event.preventDefault();
										markAsRead(notification.id);
									}}
									className="items-start gap-3 p-3"
								>
									<Icon className={cn("mt-0.5 size-4 shrink-0", className)} aria-hidden />

									<div className="min-w-0 flex-1 space-y-1">
										<div className="flex items-center justify-between gap-2">
											<p className={cn("truncate text-sm leading-none", !notification.read && "font-semibold")}>
												{notification.title}
											</p>
											{!notification.read && (
												<span className="size-2 shrink-0 rounded-full bg-blue-600" aria-label="Unread" />
											)}
										</div>

										<p className="line-clamp-2 text-xs text-muted-foreground">{notification.message}</p>

										<time dateTime={notification.createdAt} className="block text-xs text-muted-foreground">
											{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
										</time>
									</div>
								</DropdownMenuItem>
							);
						})
					)}
				</div>

				<DropdownMenuSeparator />

				{unreadCount > 0 && (
					<DropdownMenuItem
						onSelect={(event) => {
							event.preventDefault();
							markAllAsRead();
						}}
						className="justify-center"
					>
						Mark all as read
					</DropdownMenuItem>
				)}

				<DropdownMenuItem asChild className="justify-center">
					<Link href="/notifications">View all notifications</Link>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
