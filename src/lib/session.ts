import type { ISessionUser } from "@/types/auth.types";
import { connection } from "next/server";
import { cache } from "react";
import "server-only";
import { AUTH_COOKIES } from "./cookieConfig";
import { getCookie } from "./cookieUtils";
import { verifyAccessToken } from "./jwtUtils";

// cache(): একই request-এ যত component call করুক, verify হবে একবারই।
// proxy refresh করলে request-এর cookie আপডেট করে দেয়, তাই এখানে নতুন token-ই পাওয়া যায়।
export const getSessionUser = cache(async (): Promise<ISessionUser | null> => {
	const accessToken = await getCookie(AUTH_COOKIES.accessToken);
	if (!accessToken) return null;

	// jwt.verify() ভেতরে Date.now() দিয়ে exp check করে।
	// connection(): Next-কে বলে এটা prerender-এ না, আসল request-এর সময় চালাও।
	await connection();

	const payload = verifyAccessToken(accessToken);
	if (!payload) return null;

	return { name: payload.name, email: payload.email, role: payload.role };
});
