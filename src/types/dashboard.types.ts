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

// backend-এর prisma enum AppointmentStatus-এর সাথে মিল রাখো
export type AppointmentStatus = "SCHEDULED" | "INPROGRESS" | "COMPLETED" | "CANCELED";

export interface PieChartData {
	status: AppointmentStatus;
	count: number;
}

export interface BarChartData {
	month: string;
	count: number;
}
