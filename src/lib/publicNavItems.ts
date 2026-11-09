export interface PublicNavItem {
	title: string;
	href: string;
}

// নতুন menu লাগলে শুধু এখানে এক লাইন যোগ করো, desktop আর mobile দুটোতেই চলে আসবে
export const publicNavItems: PublicNavItem[] = [
	{ title: "Home", href: "/" },
	{ title: "Consultation", href: "/consultation" },
	{ title: "Health Plans", href: "/health-plans" },
	{ title: "Medicine", href: "/medicine" },
	{ title: "Diagnostics", href: "/diagnostics" },
	{ title: "NGOs", href: "/ngos" },
];
