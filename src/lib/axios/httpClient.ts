import type { ApiResponse } from "@/types/api.types";
import axios, { type AxiosInstance, type Method } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
	throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined in environment variables");
}

export interface ApiRequestOptions {
	params?: Record<string, unknown>;
	headers?: Record<string, string>;
}

// পরে cookie যোগ করার সময় শুধু এই function বদলাতে হবে
const axiosInstance = async (): Promise<AxiosInstance> => {
	return axios.create({
		baseURL: API_BASE_URL,
		timeout: 30000,
		headers: {
			"Content-Type": "application/json",
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
			headers: options?.headers,
		});
		return response.data;
	} catch (error) {
		console.error(`${method} request to ${endpoint} failed:`, error);
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
