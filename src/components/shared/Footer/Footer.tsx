import { publicNavItems } from "@/lib/publicNavItems";
import { cacheLife } from "next/cache";
import Link from "next/link";

// cacheComponents চালু থাকায় সরাসরি new Date() লিখলে build error দেয়।
// "use cache" দিয়ে সাল-টা cache করা হলো, দিনে একবার নতুন করে হিসাব হবে।
async function CurrentYear() {
	"use cache";
	cacheLife("days");
	return new Date().getFullYear();
}

export default function Footer() {
	return (
		<footer className="border-t bg-muted/30">
			<div className="container mx-auto flex flex-col items-center gap-4 px-4 py-6 md:flex-row md:justify-between">
				{/* বাম পাশে copyright */}
				<p className="text-sm text-muted-foreground">
					© <CurrentYear /> <span className="font-semibold text-primary">Phdoc</span>. All rights reserved.
				</p>

				{/* ডান পাশে menu, header-এর সেই একই config থেকে */}
				<nav aria-label="Footer navigation">
					<ul className="flex flex-wrap justify-center gap-x-4 gap-y-2">
						{publicNavItems.map((item) => (
							<li key={item.href}>
								<Link
									href={item.href}
									className="text-sm text-muted-foreground transition-colors hover:text-foreground"
								>
									{item.title}
								</Link>
							</li>
						))}
					</ul>
				</nav>
			</div>
		</footer>
	);
}
