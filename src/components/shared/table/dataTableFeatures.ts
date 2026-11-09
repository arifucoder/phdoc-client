import { type ColumnDef, type RowData, rowSortingFeature, tableFeatures } from "@tanstack/react-table";

// v9: যে feature লাগবে শুধু সেটাই যোগ হয় (bundle ছোট থাকে)।
// sorting/pagination backend করে (manual), তাই sortedRowModel বা paginatedRowModel লাগে না।
export const dataTableFeatures = tableFeatures({ rowSortingFeature });

export type DataTableFeatures = typeof dataTableFeatures;

// প্রতিটা table-এর column এই type দিয়ে লিখবে
export type DataTableColumnDef<TData extends RowData> = ColumnDef<DataTableFeatures, TData>;
