import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Suspense } from "react";

async function NGOsContent() {
	await new Promise((r) => setTimeout(r, 2000)); // test-এর জন্য, পরে মুছে দিও
	return <h1>NGOs</h1>;
}

export default function NGOsPage() {
	return (
		<Suspense fallback={<LoadingSpinner text="Loading NGOs..." />}>
			<NGOsContent />
		</Suspense>
	);
}
