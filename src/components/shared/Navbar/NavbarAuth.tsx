import UserDropdown from "@/components/modules/Dashboard/UserDropdown";
import { Button } from "@/components/ui/button";
import { getDefaultDashboardRoute } from "@/lib/authUtils";
import { getSessionUser } from "@/lib/session";
import Link from "next/link";

// cookie পড়ে, তাই Navbar-এ এটা Suspense-এর ভেতরে রাখা হয়েছে
export default async function NavbarAuth() {
	const user = await getSessionUser();

	if (!user) {
		return (
			<Button asChild>
				<Link href="/login">Login</Link>
			</Button>
		);
	}

	return <UserDropdown user={user} dashboardHome={getDefaultDashboardRoute(user.role)} />;
}
