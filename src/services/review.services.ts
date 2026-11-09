"use server";

import { httpClient } from "@/lib/axios/httpClient";
import type { IReview } from "@/types/review.types";

// public route: ?doctorId=...&limit=5&sortBy=createdAt&sortOrder=desc
export const getReviews = async (queryString: string) =>
	httpClient.get<IReview[]>(queryString ? `/reviews?${queryString}` : "/reviews");
