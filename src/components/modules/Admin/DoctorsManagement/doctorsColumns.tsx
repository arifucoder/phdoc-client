import DateCell from "@/components/shared/table/cells/DateCell";
import UserInfoCell from "@/components/shared/table/cells/UserInfoCell";
import type { DataTableColumnDef } from "@/components/shared/table/dataTableFeatures";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatters";
import type { IDoctor } from "@/types/doctor.types";
import { Star } from "lucide-react";

// ⚠️ sortable column-এর accessorKey = backend-এর sortBy field
// (doctorSortableFields: createdAt, name, experience, appointmentFee, averageRating)
export const doctorColumns: DataTableColumnDef<IDoctor>[] = [
	{
		accessorKey: "name",
		header: "Doctor",
		cell: ({ row }) => (
			<UserInfoCell name={row.original.name} email={row.original.email} image={row.original.profilePhoto} />
		),
	},
	{
		id: "specialties",
		header: "Specialties",
		enableSorting: false,
		cell: ({ row }) => {
			const { specialties } = row.original;

			if (specialties.length === 0) {
				return <span className="text-xs text-muted-foreground">No specialties</span>;
			}

			return (
				<div className="flex max-w-60 flex-wrap gap-1">
					{specialties.map(({ specialty }) => (
						<Badge key={specialty.id} variant="secondary">
							{specialty.title}
						</Badge>
					))}
				</div>
			);
		},
	},
	{
		id: "designation",
		header: "Designation",
		enableSorting: false, // backend-এ sortable না
		cell: ({ row }) => (
			<div className="min-w-0">
				<p className="truncate">{row.original.designation}</p>
				<p className="truncate text-xs text-muted-foreground">{row.original.currentWorkingPlace}</p>
			</div>
		),
	},
	{
		accessorKey: "experience",
		header: "Experience",
		cell: ({ row }) => <span className="tabular-nums">{row.original.experience} yrs</span>,
	},
	{
		accessorKey: "appointmentFee",
		header: "Fee",
		cell: ({ row }) => <span className="tabular-nums">{formatCurrency(row.original.appointmentFee)}</span>,
	},
	{
		accessorKey: "averageRating",
		header: "Rating",
		cell: ({ row }) => (
			<span className="inline-flex items-center gap-1 tabular-nums">
				<Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
				{row.original.averageRating.toFixed(1)}
			</span>
		),
	},
	{
		accessorKey: "createdAt",
		header: "Joined",
		cell: ({ row }) => <DateCell value={row.original.createdAt} />,
	},
];
