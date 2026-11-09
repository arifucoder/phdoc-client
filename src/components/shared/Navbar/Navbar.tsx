import { Skeleton } from "@/components/ui/skeleton";
import { publicNavItems } from "@/lib/publicNavItems";
import Link from "next/link";
import { Suspense } from "react";
import MobileNav from "./MobileNav";
import NavbarAuth from "./NavbarAuth";
import NavLinks from "./NavLinks";

export default function Navbar() {
	return (
		<header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
			<div className="container mx-auto flex h-16 items-center gap-2 px-4">
				<MobileNav navItems={publicNavItems} />

				{/* বাম পাশে logo */}
				<Link href="/" className="text-xl font-bold text-primary">
					Phdoc
				</Link>

				{/* ডান পাশে menu + user */}
				<div className="ml-auto flex items-center gap-4">
					<nav aria-label="Main navigation" className="hidden md:block">
						<NavLinks navItems={publicNavItems} />
					</nav>

					{/* cookie পড়া অংশটা শুধু এখানে dynamic, বাকি header static থাকে */}
					<Suspense fallback={<Skeleton className="size-9 rounded-full" />}>
						<NavbarAuth />
					</Suspense>
				</div>
			</div>
		</header>
	);
}
