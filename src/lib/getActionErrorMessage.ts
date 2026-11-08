import type { ApiErrorResponse } from "@/types/api.types";
import axios from "axios";

const GENERIC_ERROR = "Something went wrong. Please try again.";

export const getActionErrorMessage = (error: unknown, context = "action"): string => {
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

	console.error(`[${context}]`, error instanceof Error ? error.message : "Unknown error");
	return GENERIC_ERROR;
};
