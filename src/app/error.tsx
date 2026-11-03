"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	const digest = error instanceof Error && "digest" in error ? String(error.digest) : undefined;

	return (
		<main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
			<h2 className="text-2xl font-semibold">Something went wrong!</h2>
			{digest && <p className="text-sm text-muted-foreground">Error ID: {digest}</p>}
			<button onClick={() => retry()} className="rounded-md border px-4 py-2">
				Try again
			</button>
		</main>
	);
}
