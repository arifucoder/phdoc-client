import type { IDashboardShellProps } from "@/types/dashboard.types";
import Link from "next/link";
import DashboardNav from "./DashboardNav";
import DashboardUserInfo from "./DashboardUserInfo";

export default function DashboardSidebar({ user, navItems, dashboardHome }: IDashboardShellProps) {
	return (
		// mobile-এ লুকানো, md থেকে দেখায়; mobile-এ Navbar-এর Sheet কাজ করে
		<aside className="hidden w-64 shrink-0 flex-col border-r bg-background md:flex">
			<div className="flex h-16 items-center border-b px-6">
				<Link href={dashboardHome} className="text-xl font-bold text-primary">
					Phdoc
				</Link>
			</div>

			<div className="flex-1 overflow-y-auto px-3 py-4">
				<DashboardNav navItems={navItems} dashboardHome={dashboardHome} />
			</div>

			<div className="border-t p-4">
				<DashboardUserInfo user={user} />
			</div>
		</aside>
	);
}
