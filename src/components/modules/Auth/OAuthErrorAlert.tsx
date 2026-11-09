"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSearchParams } from "next/navigation";

// backend যে error code পাঠায় (auth.controller.ts) + Google-এ cancel করলে যেটা আসে
const OAUTH_ERROR_MESSAGES: Record<string, string> = {
	no_session_found: "Google login failed. Please try again.",
	account_blocked: "Your account has been blocked. Please contact support.",
	account_deleted: "This account has been deleted.",
	access_denied: "You cancelled the Google login.",
};

const DEFAULT_MESSAGE = "Something went wrong with Google login. Please try again.";

export default function OAuthErrorAlert() {
	const error = useSearchParams().get("error");

	if (!error) return null;

	// URL-এর text সরাসরি দেখাই না, তাহলে কেউ ?error=... দিয়ে ভুয়া বার্তা দেখাতে পারবে
	return (
		<Alert variant="destructive" aria-live="polite">
			<AlertDescription>{OAUTH_ERROR_MESSAGES[error] ?? DEFAULT_MESSAGE}</AlertDescription>
		</Alert>
	);
}
