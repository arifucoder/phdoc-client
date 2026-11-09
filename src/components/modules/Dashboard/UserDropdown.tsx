"use client";

import { logoutAction } from "@/actions/auth.actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRole } from "@/lib/authUtils";
import type { ISessionUser } from "@/types/auth.types";
import { useQueryClient } from "@tanstack/react-query";
import { KeyRound, LayoutDashboard, LoaderCircle, LogOut, User } from "lucide-react";

import Link from "next/link";
import { useTransition } from "react";

interface UserDropdownProps {
	user: ISessionUser;
	dashboardHome?: string;
}

export default function UserDropdown({ user, dashboardHome }: UserDropdownProps) {
	const queryClient = useQueryClient();
	const [isLoggingOut, startTransition] = useTransition();

	const handleLogout = (event: Event) => {
		event.preventDefault(); // menu খোলা রেখে "Logging out..." দেখানো
		startTransition(async () => {
			queryClient.clear(); // আগের user-এর cached data মুছে ফেলা
			await logoutAction();
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-auto gap-2 rounded-full p-1 md:pr-3" aria-label="Open user menu">
					<Avatar>
						<AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
							{user.name.charAt(0).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<span className="hidden max-w-32 truncate text-sm font-medium md:block">{user.name}</span>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel className="space-y-1">
					<p className="truncate text-sm font-medium">{user.name}</p>
					<p className="truncate text-xs font-normal text-muted-foreground">{user.email}</p>
					<p className="text-xs font-normal capitalize text-primary">{formatRole(user.role)}</p>
				</DropdownMenuLabel>

				<DropdownMenuSeparator />

				{/* asChild: পুরো item-টাই link, keyboard-এ Enter দিলেও কাজ করে */}
				{dashboardHome && (
					<DropdownMenuItem asChild>
						<Link href={dashboardHome}>
							<LayoutDashboard />
							Dashboard
						</Link>
					</DropdownMenuItem>
				)}
				<DropdownMenuItem asChild>
					<Link href="/my-profile">
						<User />
						My Profile
					</Link>
				</DropdownMenuItem>

				<DropdownMenuItem asChild>
					<Link href="/change-password">
						<KeyRound />
						Change Password
					</Link>
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				<DropdownMenuItem variant="destructive" disabled={isLoggingOut} onSelect={handleLogout}>
					{isLoggingOut ? <LoaderCircle className="animate-spin" /> : <LogOut />}
					{isLoggingOut ? "Logging out..." : "Logout"}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
