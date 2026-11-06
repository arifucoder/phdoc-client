// src/lib/tokenUtils.ts
import "server-only";
import { AUTH_COOKIES, SESSION_TOKEN_MAX_AGE } from "./cookieConfig";
import { setCookie } from "./cookieUtils";
import { getTokenSecondsRemaining } from "./jwtUtils";

export { getTokenSecondsRemaining };

export const isTokenExpired = (token: string) => getTokenSecondsRemaining(token) === 0;

export const isTokenExpiringSoon = (token: string, thresholdInSeconds = 300) => {
	const remaining = getTokenSecondsRemaining(token);
	return remaining > 0 && remaining <= thresholdInSeconds;
};

interface AuthTokens {
	accessToken: string;
	refreshToken: string;
	sessionToken: string;
}

export const setAuthCookies = async ({ accessToken, refreshToken, sessionToken }: AuthTokens) => {
	const accessMaxAge = getTokenSecondsRemaining(accessToken);
	const refreshMaxAge = getTokenSecondsRemaining(refreshToken);

	if (!accessMaxAge || !refreshMaxAge) {
		throw new Error("Received an invalid or expired token from the server");
	}

	await Promise.all([
		setCookie(AUTH_COOKIES.accessToken, accessToken, accessMaxAge),
		setCookie(AUTH_COOKIES.refreshToken, refreshToken, refreshMaxAge),
		setCookie(AUTH_COOKIES.sessionToken, sessionToken, SESSION_TOKEN_MAX_AGE),
	]);
};
