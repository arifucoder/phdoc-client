import LoginForm from "@/components/modules/Auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Login",
};

// searchParams পড়া হয় না, তাই পুরো page static shell-এ prerender হয়
export default function LoginPage() {
	return (
		<main className="flex min-h-[70vh] items-center justify-center px-4 py-10">
			<LoginForm />
		</main>
	);
}
