// src/lib/cookieUtils.ts
import { cookies } from "next/headers";
import "server-only";
import { AUTH_COOKIES, type AuthCookieName, getAuthCookieDeleteOptions, getAuthCookieOptions } from "./cookieConfig";
export const setCookie = async (name: AuthCookieName, value: string, maxAgeInSeconds: number) => {
	const cookieStore = await cookies();
	cookieStore.set(name, value, getAuthCookieOptions(maxAgeInSeconds));
};

export const getCookie = async (name: AuthCookieName) => {
	const cookieStore = await cookies();
	return cookieStore.get(name)?.value;
};

export const clearAuthCookies = async () => {
	const cookieStore = await cookies();
	for (const name of Object.values(AUTH_COOKIES)) {
		cookieStore.delete(getAuthCookieDeleteOptions(name));
	}
};
