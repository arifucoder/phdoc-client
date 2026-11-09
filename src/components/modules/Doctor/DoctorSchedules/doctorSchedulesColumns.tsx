import DateCell from "@/components/shared/table/cells/DateCell";
import type { DataTableColumnDef } from "@/components/shared/table/dataTableFeatures";
import { Badge } from "@/components/ui/badge";
import { formatClinicTime, getDurationMinutes } from "@/lib/scheduleTime";
import type { IDoctorSchedule } from "@/types/doctorSchedule.types";

// ⚠️ sortable column-এর id = backend-এর sortBy field
// nested field, তাই accessorKey-এর বদলে id + accessorFn
export const doctorScheduleColumns: DataTableColumnDef<IDoctorSchedule>[] = [
	{
		id: "schedule.startDateTime",
		accessorFn: (row) => row.schedule.startDateTime,
		header: "Date",
		cell: ({ row }) => <DateCell value={row.original.schedule.startDateTime} />,
	},
	{
		id: "time",
		header: "Time",
		enableSorting: false,
		cell: ({ row }) => (
			<span className="whitespace-nowrap tabular-nums">
				{formatClinicTime(row.original.schedule.startDateTime)} – {formatClinicTime(row.original.schedule.endDateTime)}
			</span>
		),
	},
	{
		id: "duration",
		header: "Duration",
		enableSorting: false,
		cell: ({ row }) => {
			const minutes = getDurationMinutes(row.original.schedule.startDateTime, row.original.schedule.endDateTime);
			return minutes ? (
				<span className="tabular-nums">{minutes} min</span>
			) : (
				<span className="text-muted-foreground">—</span>
			);
		},
	},
	{
		accessorKey: "isBooked",
		header: "Status",
		enableSorting: false,
		cell: ({ row }) => (row.original.isBooked ? <Badge>Booked</Badge> : <Badge variant="outline">Available</Badge>),
	},
	{
		accessorKey: "createdAt",
		header: "Added on",
		cell: ({ row }) => <DateCell value={row.original.createdAt} />,
	},
];
