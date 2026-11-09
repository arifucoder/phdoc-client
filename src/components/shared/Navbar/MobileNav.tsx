"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { PublicNavItem } from "@/lib/publicNavItems";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import NavLinks from "./NavLinks";

export default function MobileNav({ navItems }: { navItems: PublicNavItem[] }) {
	const [open, setOpen] = useState(false);
	const closeMenu = () => setOpen(false);

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
					<Menu />
				</Button>
			</SheetTrigger>

			<SheetContent side="left" className="w-72 gap-0 p-0">
				<SheetTitle className="sr-only">Main menu</SheetTitle>
				<SheetDescription className="sr-only">Site pages</SheetDescription>

				<div className="flex h-16 items-center border-b px-6">
					<Link href="/" onClick={closeMenu} className="text-xl font-bold text-primary">
						Phdoc
					</Link>
				</div>

				<nav aria-label="Mobile navigation" className="p-3">
					{/* একই NavLinks, শুধু খাড়া করে সাজানো */}
					<NavLinks navItems={navItems} onNavigate={closeMenu} className="flex-col items-stretch" />
				</nav>
			</SheetContent>
		</Sheet>
	);
}
