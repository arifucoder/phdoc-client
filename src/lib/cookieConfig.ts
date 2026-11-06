export const AUTH_COOKIES = {
	accessToken: "accessToken",
	refreshToken: "refreshToken",
	sessionToken: "better-auth.session_token",
} as const;

export type AuthCookieName = (typeof AUTH_COOKIES)[keyof typeof AUTH_COOKIES];

// backend-এর BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN (604800 = 7 দিন)-এর সাথে sync রাখো
export const SESSION_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

export const getAuthCookieOptions = (maxAgeInSeconds: number) => ({
	httpOnly: true, // JS দিয়ে পড়া যাবে না → XSS হলেও token চুরি হবে না
	secure: process.env.NODE_ENV === "production", // Safari localhost-এ secure cookie রাখে না
	sameSite: "lax" as const, // CSRF থেকে সুরক্ষা
	path: "/",
	maxAge: maxAgeInSeconds,
});
