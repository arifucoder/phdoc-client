"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function GoogleLoginButton() {
	const [isRedirecting, setIsRedirecting] = useState(false);

	// Google page থেকে browser-এর Back চাপলে page cache থেকে ফেরে (bfcache),
	// তখন button "Redirecting..." অবস্থায় আটকে না থাকে
	useEffect(() => {
		const handlePageShow = (event: PageTransitionEvent) => {
			if (event.persisted) setIsRedirecting(false);
		};
		window.addEventListener("pageshow", handlePageShow);
		return () => window.removeEventListener("pageshow", handlePageShow);
	}, []);

	const handleClick = () => {
		setIsRedirecting(true);

		// proxy যে ?redirect=/dashboard/... বসিয়েছিল, সেটা backend-কে পাঠানো
		// backend-এর getSafeRedirectPath এটা যাচাই করে ("//evil.com" বাতিল)
		const redirect = new URLSearchParams(window.location.search).get("redirect");
		const url = new URL(`${API_BASE_URL}/auth/login/google`);
		if (redirect) url.searchParams.set("redirect", redirect);

		// axios/fetch না: পুরো page-কেই backend → Google-এ যেতে হবে
		window.location.assign(url.toString());
	};

	return (
		<Button type="button" variant="outline" className="w-full" disabled={isRedirecting} onClick={handleClick}>
			{isRedirecting ? <Spinner /> : <Image src="/google.svg" alt="" width={16} height={16} />}
			{isRedirecting ? "Redirecting..." : "Continue with Google"}
		</Button>
	);
}
