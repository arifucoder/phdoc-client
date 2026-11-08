export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface ApiResponse<TData = unknown> {
	success: true;
	message: string;
	data: TData;
	meta?: PaginationMeta;
}

export interface ApiErrorResponse {
	success: false;
	message: string;
}

// server action সবসময় এর একটা return করে, throw করে না
// (production-এ thrown error-এর message client পর্যন্ত পৌঁছায় না)
export type ActionResult<TData> = ApiResponse<TData> | ApiErrorResponse;
