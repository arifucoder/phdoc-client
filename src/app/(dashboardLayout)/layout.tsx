import DashboardNavbar from "@/components/modules/Dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/modules/Dashboard/DashboardSidebar";
import { getDefaultDashboardRoute } from "@/lib/authUtils";
import { getNavItemsByRole } from "@/lib/navItems";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function RootDashboardLayout({ children }: LayoutProps<"/">) {
	const user = await getSessionUser();

	// proxy আগেই আটকায়; এটা দ্বিতীয় সুরক্ষা (defense in depth)
	if (!user) redirect("/login");

	// একবার হিসাব করে দুই component-কে পাঠানো
	const navItems = getNavItemsByRole(user.role);
	const dashboardHome = getDefaultDashboardRoute(user.role);

	return (
		<div className="flex h-dvh overflow-hidden">
			<DashboardSidebar user={user} navItems={navItems} dashboardHome={dashboardHome} />

			<div className="flex min-w-0 flex-1 flex-col overflow-hidden">
				<DashboardNavbar user={user} navItems={navItems} dashboardHome={dashboardHome} />

				<main className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-6">{children}</main>
			</div>
		</div>
	);
}
