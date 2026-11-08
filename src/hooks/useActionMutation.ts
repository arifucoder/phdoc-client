"use client";

import type { ActionResult } from "@/types/api.types";
import { type QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UseActionMutationOptions<TVariables, TData> {
	action: (variables: TVariables) => Promise<ActionResult<TData>>;
	invalidateKey: QueryKey; // সফল হলে কোন data আবার আনতে হবে
	successMessage: string | ((data: TData) => string);
	onSuccess?: (data: TData) => void;
}

export function useActionMutation<TVariables, TData>({
	action,
	invalidateKey,
	successMessage,
	onSuccess,
}: UseActionMutationOptions<TVariables, TData>) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (variables: TVariables) => {
			const result = await action(variables);
			// action error return করে (throw করে না); এখানে throw করলে React Query isError বোঝে
			if (!result.success) throw new Error(result.message);
			return result.data;
		},
		onSuccess: async (data) => {
			// await: table নতুন data পাওয়া পর্যন্ত বাটন "loading" থাকে, তারপর dialog বন্ধ হয়
			await queryClient.invalidateQueries({ queryKey: invalidateKey });
			toast.success(typeof successMessage === "function" ? successMessage(data) : successMessage);
			onSuccess?.(data);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
}
