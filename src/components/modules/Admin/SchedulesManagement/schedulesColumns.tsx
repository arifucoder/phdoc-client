import DateCell from "@/components/shared/table/cells/DateCell";
import type { DataTableColumnDef } from "@/components/shared/table/dataTableFeatures";
import { Badge } from "@/components/ui/badge";
import { formatClinicTime, getDurationMinutes } from "@/lib/scheduleTime";
import type { ISchedule } from "@/types/schedule.types";
import { getBookedCount } from "./schedule.utils";

const EMPTY = <span className="text-muted-foreground">—</span>;

// ⚠️ sortable column-এর accessorKey = backend-এর sortBy field (startDateTime, createdAt)
export const scheduleColumns: DataTableColumnDef<ISchedule>[] = [
	{
		accessorKey: "startDateTime",
		header: "Date",
		cell: ({ row }) => <DateCell value={row.original.startDateTime} />,
	},
	{
		id: "time",
		header: "Time",
		enableSorting: false,
		cell: ({ row }) => (
			<span className="whitespace-nowrap tabular-nums">
				{formatClinicTime(row.original.startDateTime)} – {formatClinicTime(row.original.endDateTime)}
			</span>
		),
	},
	{
		id: "duration",
		header: "Duration",
		enableSorting: false,
		cell: ({ row }) => {
			const minutes = getDurationMinutes(row.original.startDateTime, row.original.endDateTime);
			return minutes ? <span className="tabular-nums">{minutes} min</span> : EMPTY;
		},
	},
	{
		id: "doctors",
		header: "Doctors",
		enableSorting: false,
		cell: ({ row }) => {
			const total = row.original.doctorSchedules?.length ?? 0;

			if (total === 0) {
				return <span className="text-xs text-muted-foreground">Not assigned</span>;
			}

			return (
				<Badge variant="secondary">
					{total} {total === 1 ? "doctor" : "doctors"}
				</Badge>
			);
		},
	},
	{
		id: "booked",
		header: "Booked",
		enableSorting: false,
		cell: ({ row }) => {
			const booked = getBookedCount(row.original);
			return booked > 0 ? <Badge>{booked} booked</Badge> : EMPTY;
		},
	},
	{
		accessorKey: "createdAt",
		header: "Created",
		cell: ({ row }) => <DateCell value={row.original.createdAt} />,
	},
];
