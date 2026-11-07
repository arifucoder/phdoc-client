import type { NavIconName } from "@/lib/iconMapper";
import type { ISessionUser } from "@/types/auth.types";

export interface NavItem {
	title: string;
	href: string;
	icon: NavIconName; // string না: ভুল নাম compile-এর সময়েই ধরা পড়বে
}

export interface NavSection {
	title?: string;
	items: NavItem[];
}

// layout → Sidebar/Navbar-এ একই props যায়
export interface IDashboardShellProps {
	user: ISessionUser;
	navItems: NavSection[];
	dashboardHome: string;
}
