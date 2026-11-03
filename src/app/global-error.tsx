"use client";

import "./globals.css";

export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
	return (
		<html lang="en">
			<body className="flex min-h-screen flex-col items-center justify-center gap-4">
				<title>Something went wrong</title>
				<h2 className="text-2xl font-semibold">Something went wrong!</h2>
				<button onClick={() => retry()} className="rounded-md border px-4 py-2">
					Try again
				</button>
			</body>
		</html>
	);
}
