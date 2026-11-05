import { cookies } from "next/headers";
import "server-only";

export const AUTH_COOKIES = {
	accessToken: "accessToken",
	refreshToken: "refreshToken",
	sessionToken: "better-auth.session_token",
} as const;

export type AuthCookieName = (typeof AUTH_COOKIES)[keyof typeof AUTH_COOKIES];

const isProduction = process.env.NODE_ENV === "production";

export const setCookie = async (name: AuthCookieName, value: string, maxAgeInSeconds: number) => {
	const cookieStore = await cookies();

	cookieStore.set(name, value, {
		httpOnly: true, // JavaScript দিয়ে পড়া যাবে না, তাই XSS হলেও token চুরি করা যাবে না
		secure: isProduction, // Safari localhost-এ secure cookie রাখে না
		sameSite: "lax", // CSRF থেকে সুরক্ষা
		path: "/",
		maxAge: maxAgeInSeconds,
	});
};

export const getCookie = async (name: AuthCookieName) => {
	const cookieStore = await cookies();
	return cookieStore.get(name)?.value;
};

export const clearAuthCookies = async () => {
	const cookieStore = await cookies();
	for (const name of Object.values(AUTH_COOKIES)) {
		cookieStore.delete(name);
	}
};
