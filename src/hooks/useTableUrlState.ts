"use client";

import type { SortingState } from "@tanstack/react-table";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

type ParamValue = string | string[] | undefined;

interface SetParamsOptions {
	resetPage?: boolean; // filter/sort/search বদলালে page 1-এ ফেরা
	replace?: boolean; // search-এ প্রতি অক্ষরে history ভরে না যায়
}

const toPositiveInt = (value: string | null, fallback: number) => {
	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export function useTableUrlState({ defaultLimit }: { defaultLimit: number }) {
	const searchParams = useSearchParams();
	const pathname = usePathname();

	// pushState শুধু URL বদলায়: Next.js useSearchParams আপডেট করে, কিন্তু server-এ আবার request যায় না।
	// নতুন data আনে শুধু useQuery (teacher-এর router.refresh()-এ দুবার আসত)।
	const setParams = useCallback(
		(update: (params: URLSearchParams) => void, { resetPage = true, replace = false }: SetParamsOptions = {}) => {
			const params = new URLSearchParams(window.location.search);
			update(params);
			if (resetPage) params.delete("page"); // default = 1, URL পরিষ্কার থাকে

			const query = params.toString();
			const url = query ? `${pathname}?${query}` : pathname;
			window.history[replace ? "replaceState" : "pushState"](null, "", url);
		},
		[pathname],
	);

	// ---------- read ----------
	const page = toPositiveInt(searchParams.get("page"), 1);
	const limit = toPositiveInt(searchParams.get("limit"), defaultLimit);
	const searchTerm = searchParams.get("searchTerm") ?? "";

	const sortBy = searchParams.get("sortBy");
	const sortOrder = searchParams.get("sortOrder");
	const sorting = useMemo<SortingState>(
		() => (sortBy && (sortOrder === "asc" || sortOrder === "desc") ? [{ id: sortBy, desc: sortOrder === "desc" }] : []),
		[sortBy, sortOrder],
	);

	// ---------- write ----------
	const setSorting = useCallback(
		(next: SortingState) =>
			setParams((params) => {
				const [first] = next;
				if (first) {
					params.set("sortBy", first.id);
					params.set("sortOrder", first.desc ? "desc" : "asc");
				} else {
					params.delete("sortBy");
					params.delete("sortOrder");
				}
			}),
		[setParams],
	);

	const setPage = useCallback(
		(nextPage: number) => setParams((params) => params.set("page", String(nextPage)), { resetPage: false }),
		[setParams],
	);

	const setLimit = useCallback(
		(nextLimit: number) => setParams((params) => params.set("limit", String(nextLimit))),
		[setParams],
	);

	const setSearchTerm = useCallback(
		(term: string) =>
			setParams(
				(params) => {
					if (term) params.set("searchTerm", term);
					else params.delete("searchTerm");
				},
				{ replace: true },
			),
		[setParams],
	);

	// একসাথে একাধিক key (যেমন fee-র min আর max) → একটাই URL পরিবর্তন
	const setFilters = useCallback(
		(updates: Record<string, ParamValue>) =>
			setParams((params) => {
				for (const [key, value] of Object.entries(updates)) {
					params.delete(key);
					const values = value === undefined ? [] : Array.isArray(value) ? value : [value];
					for (const item of values) {
						if (item) params.append(key, item);
					}
				}
			}),
		[setParams],
	);

	const clearParams = useCallback(
		(keys: readonly string[]) =>
			setParams((params) => {
				for (const key of keys) params.delete(key);
			}),
		[setParams],
	);

	return {
		searchParams,
		page,
		limit,
		searchTerm,
		sorting,
		setSorting,
		setPage,
		setLimit,
		setSearchTerm,
		setFilters,
		clearParams,
		getFilter: (key: string) => searchParams.get(key) ?? undefined,
		getFilterList: (key: string) => searchParams.getAll(key),
	};
}
