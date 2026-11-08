"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { functionalUpdate, type SortDirection, type SortingState, useTable } from "@tanstack/react-table";
import { cn } from "cn";
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { type DataTableColumnDef, dataTableFeatures } from "./dataTableFeatures";

export interface DataTableRowActions<TData> {
	onView?: (row: TData) => void;
	onEdit?: (row: TData) => void;
	onDelete?: (row: TData) => void;
}

interface DataTableProps<TData> {
	data: TData[];
	columns: DataTableColumnDef<TData>[];
	getRowId: (row: TData) => string; // index-এর বদলে আসল id: delete-এর পর ভুল row-এ state যায় না
	isLoading?: boolean; // প্রথমবার, এখনো কোনো data নেই
	isFetching?: boolean; // পুরনো data দেখাচ্ছে, নতুন আসছে
	emptyMessage?: string;
	sorting?: {
		state: SortingState;
		onSortingChange: (state: SortingState) => void;
	};
	actions?: DataTableRowActions<TData>;
}

const SKELETON_ROW_COUNT = 5;

const SortIcon = ({ direction }: { direction: false | SortDirection }) => {
	if (direction === "asc") return <ArrowUp className="size-3.5" aria-hidden />;
	if (direction === "desc") return <ArrowDown className="size-3.5" aria-hidden />;
	return <ArrowUpDown className="size-3.5 opacity-50" aria-hidden />;
};

const toAriaSort = (direction: false | SortDirection) =>
	direction === "asc" ? "ascending" : direction === "desc" ? "descending" : undefined;

// row-এর শেষে "⋯" menu: যে action দেওয়া হয়েছে শুধু সেটাই দেখায়
const createActionsColumn = <TData,>(actions: DataTableRowActions<TData>): DataTableColumnDef<TData> => ({
	id: "actions",
	header: () => <span className="sr-only">Actions</span>,
	enableSorting: false,
	cell: ({ row }) => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" aria-label="Open row actions">
					<MoreHorizontal />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{actions.onView && (
					<DropdownMenuItem onSelect={() => actions.onView?.(row.original)}>
						<Eye />
						View
					</DropdownMenuItem>
				)}
				{actions.onEdit && (
					<DropdownMenuItem onSelect={() => actions.onEdit?.(row.original)}>
						<Pencil />
						Edit
					</DropdownMenuItem>
				)}
				{actions.onDelete && (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuItem variant="destructive" onSelect={() => actions.onDelete?.(row.original)}>
							<Trash2 />
							Delete
						</DropdownMenuItem>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	),
});

export default function DataTable<TData>({
	data,
	columns,
	getRowId,
	isLoading = false,
	isFetching = false,
	emptyMessage = "No results found.",
	sorting,
	actions,
}: DataTableProps<TData>) {
	const allColumns = useMemo(
		() => (actions ? [...columns, createActionsColumn(actions)] : columns),
		[columns, actions],
	);

	const table = useTable({
		features: dataTableFeatures,
		columns: allColumns,
		data,
		getRowId,
		manualSorting: true, // sort backend করে, table শুধু state দেখায়
		enableSorting: Boolean(sorting),
		state: { sorting: sorting?.state ?? [] },
		onSortingChange: (updater) => {
			if (sorting) sorting.onSortingChange(functionalUpdate(updater, sorting.state));
		},
	});

	const rows = table.getRowModel().rows;

	return (
		<div className="overflow-hidden rounded-lg border">
			<Table aria-busy={isLoading || isFetching}>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								const direction = header.column.getIsSorted();

								return (
									<TableHead key={header.id} aria-sort={toAriaSort(direction)}>
										{header.isPlaceholder ? null : header.column.getCanSort() ? (
											<Button
												variant="ghost"
												size="sm"
												className="-ml-2.5"
												onClick={header.column.getToggleSortingHandler()}
											>
												<table.FlexRender header={header} />
												<SortIcon direction={direction} />
											</Button>
										) : (
											<table.FlexRender header={header} />
										)}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>

				{/* নতুন data আসার সময় পুরনোটা হালকা দেখায়, লাফ দেয় না */}
				<TableBody className={cn("transition-opacity", isFetching && !isLoading && "opacity-60")}>
					{isLoading ? (
						Array.from({ length: SKELETON_ROW_COUNT }, (_, rowIndex) => (
							<TableRow key={rowIndex}>
								{allColumns.map((_, cellIndex) => (
									<TableCell key={cellIndex}>
										<Skeleton className="h-5 w-full" />
									</TableCell>
								))}
							</TableRow>
						))
					) : rows.length === 0 ? (
						<TableRow>
							<TableCell colSpan={allColumns.length} className="h-24 text-center text-muted-foreground">
								{emptyMessage}
							</TableCell>
						</TableRow>
					) : (
						rows.map((row) => (
							<TableRow key={row.id}>
								{row.getAllCells().map((cell) => (
									<TableCell key={cell.id}>
										<table.FlexRender cell={cell} />
									</TableCell>
								))}
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
}
