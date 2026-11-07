import type { NavIconName } from "@/lib/iconMapper";

export interface NavItem {
	title: string;
	href: string;
	icon: NavIconName; // string না: ভুল নাম compile-এর সময়েই ধরা পড়বে
}

export interface NavSection {
	title?: string;
	items: NavItem[];
}
