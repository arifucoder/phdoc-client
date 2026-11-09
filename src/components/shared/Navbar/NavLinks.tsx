"use client";

import type { PublicNavItem } from "@/lib/publicNavItems";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinksProps {
	navItems: PublicNavItem[];
	onNavigate?: () => void; // mobile Sheet বন্ধ করার জন্য
	className?: string;
}

// "/" শুধু হুবহু মিললে active, বাকিগুলো sub-page-এও (যেমন /consultation/doctor/123)
const isActiveLink = (pathname: string, href: string) =>
	href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

export default function NavLinks({ navItems, onNavigate, className }: NavLinksProps) {
	const pathname = usePathname();

	return (
		<ul className={cn("flex items-center gap-1", className)}>
			{navItems.map((item) => {
				const isActive = isActiveLink(pathname, item.href);

				return (
					<li key={item.href}>
						<Link
							href={item.href}
							onClick={onNavigate}
							aria-current={isActive ? "page" : undefined}
							className={cn(
								"block rounded-md px-3 py-2 text-sm font-medium transition-colors",
								isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground",
							)}
						>
							{item.title}
						</Link>
					</li>
				);
			})}
		</ul>
	);
}
