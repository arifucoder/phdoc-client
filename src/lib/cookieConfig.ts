export const AUTH_COOKIES = {
	accessToken: "accessToken",
	refreshToken: "refreshToken",
	sessionToken: "better-auth.session_token",
} as const;

export type AuthCookieName = (typeof AUTH_COOKIES)[keyof typeof AUTH_COOKIES];

// backend-এর BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN (604800 = 7 দিন)-এর সাথে sync রাখো
export const SESSION_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

// production-এ ".arifuddincoder.site" → phdoc আর phdocapi দুই subdomain-ই cookie পায়
// local-এ নেই (undefined) → cookie শুধু localhost-এর জন্য
// NEXT_PUBLIC_ দেবে না: এটা শুধু server (proxy, server action)-এ লাগে
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;

// set আর delete দুই জায়গাতেই একই path + domain লাগে, নইলে browser অন্য cookie ভাবে
const cookieScope = {
	path: "/",
	...(COOKIE_DOMAIN && { domain: COOKIE_DOMAIN }),
};

export const getAuthCookieOptions = (maxAgeInSeconds: number) => ({
	httpOnly: true, // JS দিয়ে পড়া যাবে না → XSS হলেও token চুরি হবে না
	secure: process.env.NODE_ENV === "production", // Safari localhost-এ secure cookie রাখে না
	sameSite: "lax" as const, // CSRF থেকে সুরক্ষা
	maxAge: maxAgeInSeconds,
	...cookieScope,
});

// cookie মোছার সময়ও ঠিক একই domain/path দিতে হয়
export const getAuthCookieDeleteOptions = (name: AuthCookieName) => ({
	name,
	...cookieScope,
});
