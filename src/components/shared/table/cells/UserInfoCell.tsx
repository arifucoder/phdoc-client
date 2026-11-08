import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/formatters";

interface UserInfoCellProps {
	name: string;
	email: string;
	image?: string | null;
}

export default function UserInfoCell({ name, email, image }: UserInfoCellProps) {
	return (
		<div className="flex min-w-0 items-center gap-3">
			<Avatar>
				{/* alt="": নাম পাশেই লেখা, তাই screen reader-কে দুবার পড়াই না */}
				{image && <AvatarImage src={image} alt="" />}
				<AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
					{getInitials(name)}
				</AvatarFallback>
			</Avatar>

			<div className="min-w-0">
				<p className="truncate font-medium">{name}</p>
				<p className="truncate text-xs text-muted-foreground">{email}</p>
			</div>
		</div>
	);
}
