"use server";

import { getPostLoginRedirect } from "@/lib/authUtils";
import { httpClient } from "@/lib/axios/httpClient";
import { AUTH_COOKIES } from "@/lib/cookieConfig";
import { clearAuthCookies, getCookie } from "@/lib/cookieUtils";
import { getActionErrorMessage } from "@/lib/getActionErrorMessage";
import { setAuthCookies } from "@/lib/tokenUtils";
import type { ApiErrorResponse } from "@/types/api.types";
import type { ILoginResponse } from "@/types/auth.types";
import { loginZodSchema } from "@/zod/auth.validation";
import { redirect } from "next/navigation";

const EMAIL_NOT_VERIFIED = "Email not verified";

// "use server" file-এর প্রতিটা export একটা public endpoint।
// তাই input-কে unknown ধরে আবার validate করা হয়।
export async function loginAction(payload: unknown, redirectPath?: unknown): Promise<ApiErrorResponse> {
	const parsed = loginZodSchema.safeParse(payload);

	if (!parsed.success) {
		return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
	}

	let targetPath: string;

	try {
		const { data } = await httpClient.post<ILoginResponse>("/auth/login", parsed.data);

		await setAuthCookies({
			accessToken: data.accessToken,
			refreshToken: data.refreshToken,
			sessionToken: data.token,
		});

		targetPath = data.user.needPasswordChange ? "/change-password" : getPostLoginRedirect(data.user.role, redirectPath);
	} catch (error) {
		const message = getActionErrorMessage(error, "auth.actions");

		if (message !== EMAIL_NOT_VERIFIED) {
			return { success: false, message };
		}

		targetPath = `/verify-email?email=${encodeURIComponent(parsed.data.email)}`;
	}

	// try/catch-এর বাইরে: NEXT_REDIRECT ধরে আবার throw করার hack লাগে না
	redirect(targetPath);
}

export async function logoutAction(): Promise<void> {
	const sessionToken = await getCookie(AUTH_COOKIES.sessionToken);

	if (sessionToken) {
		try {
			// backend DB থেকে session মুছে দেয় → token চুরি হলেও আর কাজ করবে না
			await httpClient.post("/auth/logout", undefined, {
				headers: { Cookie: `${AUTH_COOKIES.sessionToken}=${sessionToken}` },
			});
		} catch {
			// backend fail হলেও (httpClient নিজেই log করে) নিজের দিকের cookie মুছে logout করাতেই হবে
		}
	}

	await clearAuthCookies();
	redirect("/login");
}
