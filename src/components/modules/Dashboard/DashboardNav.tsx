"use client";

import { Separator } from "@/components/ui/separator";
import { getIconComponent } from "@/lib/iconMapper";
import type { NavSection } from "@/types/dashboard.types";
import { cn } from "cn";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardNavProps {
	navItems: NavSection[];
	dashboardHome: string;
	onNavigate?: () => void; // mobile Sheet বন্ধ করার জন্য
}

// "/" আর dashboard home শুধু হুবহু মিললে active।
// বাকিগুলো sub-page-এও active, যেমন /admin/dashboard/admins-management/123।
const isActiveLink = (pathname: string, href: string, dashboardHome: string) => {
	if (href === "/" || href === dashboardHome) return pathname === href;
	return pathname === href || pathname.startsWith(`${href}/`);
};

export default function DashboardNav({ navItems, dashboardHome, onNavigate }: DashboardNavProps) {
	const pathname = usePathname();

	return (
		<nav aria-label="Dashboard navigation" className="space-y-4">
			{navItems.map((section, index) => (
				<div key={section.title ?? `section-${index}`}>
					{index > 0 && <Separator className="mb-4" />}

					{section.title && (
						<h4 className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">{section.title}</h4>
					)}

					<ul className="space-y-1">
						{section.items.map((item) => {
							const Icon = getIconComponent(item.icon);
							const isActive = isActiveLink(pathname, item.href, dashboardHome);

							return (
								<li key={item.href}>
									<Link
										href={item.href}
										onClick={onNavigate}
										aria-current={isActive ? "page" : undefined}
										className={cn(
											"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
											isActive
												? "bg-primary text-primary-foreground"
												: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
										)}
									>
										<Icon className="size-4 shrink-0" aria-hidden />
										<span className="truncate">{item.title}</span>
									</Link>
								</li>
							);
						})}
					</ul>
				</div>
			))}
		</nav>
	);
}
