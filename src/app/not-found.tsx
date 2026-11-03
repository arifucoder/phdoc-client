import Link from "next/link";

export default function NotFound() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
			<h1 className="text-4xl font-bold">404</h1>
			<p className="text-muted-foreground">The page you are looking for does not exist.</p>
			<Link href="/" className="underline">
				Go back home
			</Link>
		</main>
	);
}
