import { AUTH_COOKIES } from "@/lib/cookieConfig";
import type { ApiResponse } from "@/types/api.types";
import axios, { type AxiosInstance, type Method } from "axios";
import { cookies } from "next/headers";
import { connection } from "next/server";
import "server-only";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
	throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined in environment variables");
}

export interface ApiRequestOptions {
	params?: Record<string, unknown>;
	headers?: Record<string, string>;
}

// browser-এর cookie Next server-এ আসে, কিন্তু axios নিজে থেকে backend-এ পাঠায় না।
// শুধু checkAuth-এর দরকারি দুটো cookie পাঠাই (সব cookie না)।
// refreshToken পাঠাই না: ওটা শুধু refresh endpoint-এর জন্য, proxy সেটা সামলায়।
const getAuthCookieHeader = async (): Promise<string | undefined> => {
	const cookieStore = await cookies();

	const pairs = [AUTH_COOKIES.accessToken, AUTH_COOKIES.sessionToken]
		.map((name) => {
			const value = cookieStore.get(name)?.value;
			return value ? `${name}=${value}` : null;
		})
		.filter((pair): pair is string => pair !== null);

	return pairs.length > 0 ? pairs.join("; ") : undefined;
};

const axiosInstance = async (): Promise<AxiosInstance> => {
	// axios ভেতরে Date.now() ব্যবহার করে, যেটা Next.js চেনে না।
	// connection() Next-কে বলে: এই request আসল request-time-এ চালাও, prerender কোরো না।
	await connection();

	const cookieHeader = await getAuthCookieHeader();

	return axios.create({
		baseURL: API_BASE_URL,
		timeout: 30000,
		headers: {
			"Content-Type": "application/json",
			...(cookieHeader && { Cookie: cookieHeader }),
		},
	});
};

const request = async <TData>(
	method: Method,
	endpoint: string,
	data?: unknown,
	options?: ApiRequestOptions,
): Promise<ApiResponse<TData>> => {
	try {
		const instance = await axiosInstance();
		const response = await instance.request<ApiResponse<TData>>({
			method,
			url: endpoint,
			data,
			params: options?.params,
			headers: options?.headers, // এখানে Cookie দিলে (যেমন logoutAction) উপরেরটার বদলে এটা যায়
		});
		return response.data;
	} catch (error) {
		// পুরো error log কোরো না: error.config.data-তে request body (password) থাকে
		if (axios.isAxiosError(error)) {
			console.error(`[httpClient] ${method} ${endpoint} failed`, {
				status: error.response?.status,
				code: error.code,
			});
		} else {
			console.error(`[httpClient] ${method} ${endpoint} failed`, error instanceof Error ? error.message : error);
		}
		throw error;
	}
};

export const httpClient = {
	get: <TData>(endpoint: string, options?: ApiRequestOptions) => request<TData>("GET", endpoint, undefined, options),

	post: <TData>(endpoint: string, data: unknown, options?: ApiRequestOptions) =>
		request<TData>("POST", endpoint, data, options),

	put: <TData>(endpoint: string, data: unknown, options?: ApiRequestOptions) =>
		request<TData>("PUT", endpoint, data, options),

	patch: <TData>(endpoint: string, data: unknown, options?: ApiRequestOptions) =>
		request<TData>("PATCH", endpoint, data, options),

	delete: <TData>(endpoint: string, options?: ApiRequestOptions) =>
		request<TData>("DELETE", endpoint, undefined, options),
};
