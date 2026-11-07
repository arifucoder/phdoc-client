import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatRole } from "@/lib/authUtils";
import type { ISessionUser } from "@/types/auth.types";

export default function DashboardUserInfo({ user }: { user: ISessionUser }) {
	return (
		<div className="flex min-w-0 items-center gap-3">
			<Avatar>
				<AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
					{user.name.charAt(0).toUpperCase()}
				</AvatarFallback>
			</Avatar>

			<div className="min-w-0">
				<p className="truncate text-sm font-medium">{user.name}</p>
				<p className="text-xs capitalize text-muted-foreground">{formatRole(user.role)}</p>
			</div>
		</div>
	);
}
