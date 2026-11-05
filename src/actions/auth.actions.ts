"use server";

import { getPostLoginRedirect } from "@/lib/authUtils";
import { httpClient } from "@/lib/axios/httpClient";
import { setAuthCookies } from "@/lib/tokenUtils";
import type { ApiErrorResponse } from "@/types/api.types";
import type { ILoginResponse } from "@/types/auth.types";
import { loginZodSchema } from "@/zod/auth.validation";
import axios from "axios";
import { redirect } from "next/navigation";

const GENERIC_ERROR = "Something went wrong. Please try again.";
const EMAIL_NOT_VERIFIED = "Email not verified";

const getErrorMessage = (error: unknown): string => {
	if (axios.isAxiosError<ApiErrorResponse>(error)) {
		const { response } = error;

		if (!response) {
			return error.code === "ECONNABORTED"
				? "The server took too long to respond. Please try again."
				: "Unable to reach the server. Please check your connection.";
		}

		// 5xx-এর ভেতরের details user-কে দেখানো হয় না
		if (response.status >= 500) return GENERIC_ERROR;

		return response.data?.message ?? GENERIC_ERROR;
	}

	console.error("[auth.actions]", error instanceof Error ? error.message : "Unknown error");
	return GENERIC_ERROR;
};

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
		const message = getErrorMessage(error);

		if (message !== EMAIL_NOT_VERIFIED) {
			return { success: false, message };
		}

		targetPath = `/verify-email?email=${encodeURIComponent(parsed.data.email)}`;
	}

	// try/catch-এর বাইরে: NEXT_REDIRECT ধরে আবার throw করার hack লাগে না
	redirect(targetPath);
}
