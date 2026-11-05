import jwt from "jsonwebtoken";
import "server-only";
import { AUTH_COOKIES, setCookie } from "./cookieUtils";

// backend-এর BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN (604800 = 7 দিন)-এর সাথে sync রাখো
const SESSION_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

export const getTokenSecondsRemaining = (token: string): number => {
	// decode শুধু payload পড়ে, signature verify করে না। এখানে শুধু exp জানা দরকার।
	const payload = jwt.decode(token);

	if (!payload || typeof payload === "string" || typeof payload.exp !== "number") {
		return 0;
	}

	return Math.max(payload.exp - Math.floor(Date.now() / 1000), 0);
};

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
