"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { IDashboardShellProps } from "@/types/dashboard.types";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import DashboardNav from "./DashboardNav";
import DashboardUserInfo from "./DashboardUserInfo";
import NotificationDropdown from "./NotificationDropdown";

export default function DashboardNavbar({ user, navItems, dashboardHome }: IDashboardShellProps) {
	const [open, setOpen] = useState(false);
	const closeMenu = () => setOpen(false);

	return (
		<header className="flex h-16 shrink-0 items-center gap-3 border-b bg-background px-4 md:px-6">
			{/* শুধু mobile-এ */}
			<Sheet open={open} onOpenChange={setOpen}>
				<SheetTrigger asChild>
					<Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation menu">
						<Menu />
					</Button>
				</SheetTrigger>

				<SheetContent side="left" className="flex w-72 flex-col gap-0 p-0">
					{/* screen reader-এর জন্য দরকার, নইলে Radix console-এ warning দেয় */}
					<SheetTitle className="sr-only">Navigation menu</SheetTitle>
					<SheetDescription className="sr-only">Dashboard pages</SheetDescription>

					<div className="flex h-16 items-center border-b px-6">
						<Link href={dashboardHome} onClick={closeMenu} className="text-xl font-bold text-primary">
							Phdoc
						</Link>
					</div>

					<div className="flex-1 overflow-y-auto px-3 py-4">
						<DashboardNav navItems={navItems} dashboardHome={dashboardHome} onNavigate={closeMenu} />
					</div>

					<div className="border-t p-4">
						<DashboardUserInfo user={user} />
					</div>
				</SheetContent>
			</Sheet>

			<Link href={dashboardHome} className="text-lg font-bold text-primary md:hidden">
				Phdoc
			</Link>

			<div className="ml-auto flex items-center gap-3">
				<NotificationDropdown />
				<DashboardUserInfo user={user} />
			</div>
		</header>
	);
}
