"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatNumber } from "@/lib/formatters";
import type { PaginationMeta } from "@/types/api.types";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const PAGE_SIZE_OPTIONS = [10, 20, 50]; // backend maxLimit 100-এর মধ্যে

interface DataTablePaginationProps {
	meta?: PaginationMeta;
	onPageChange: (page: number) => void;
	onLimitChange: (limit: number) => void;
}

export default function DataTablePagination({ meta, onPageChange, onLimitChange }: DataTablePaginationProps) {
	if (!meta || meta.total === 0) return null;

	const { page, limit, total, totalPages } = meta;
	const from = (page - 1) * limit + 1;
	const to = Math.min(page * limit, total);
	const canGoBack = page > 1;
	const canGoForward = page < totalPages;

	return (
		<div className="flex flex-col-reverse items-center justify-between gap-3 sm:flex-row">
			<p className="text-sm tabular-nums text-muted-foreground">
				Showing {formatNumber(from)}–{formatNumber(to)} of {formatNumber(total)}
			</p>

			<div className="flex flex-wrap items-center justify-center gap-4">
				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground">Rows</span>
					<Select value={String(limit)} onValueChange={(value) => onLimitChange(Number(value))}>
						<SelectTrigger className="w-18" aria-label="Rows per page">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{PAGE_SIZE_OPTIONS.map((size) => (
								<SelectItem key={size} value={String(size)}>
									{size}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<span className="text-sm tabular-nums">
					Page {page} of {totalPages}
				</span>

				<div className="flex items-center gap-1">
					<Button
						variant="outline"
						size="icon"
						onClick={() => onPageChange(1)}
						disabled={!canGoBack}
						aria-label="First page"
					>
						<ChevronsLeft />
					</Button>
					<Button
						variant="outline"
						size="icon"
						onClick={() => onPageChange(page - 1)}
						disabled={!canGoBack}
						aria-label="Previous page"
					>
						<ChevronLeft />
					</Button>
					<Button
						variant="outline"
						size="icon"
						onClick={() => onPageChange(page + 1)}
						disabled={!canGoForward}
						aria-label="Next page"
					>
						<ChevronRight />
					</Button>
					<Button
						variant="outline"
						size="icon"
						onClick={() => onPageChange(totalPages)}
						disabled={!canGoForward}
						aria-label="Last page"
					>
						<ChevronsRight />
					</Button>
				</div>
			</div>
		</div>
	);
}
