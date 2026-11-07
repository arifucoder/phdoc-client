import {
	Activity,
	Calendar,
	CalendarClock,
	CircleHelp,
	ClipboardList,
	Clock,
	CreditCard,
	FileText,
	Hospital,
	House,
	KeyRound,
	LayoutDashboard,
	type LucideIcon,
	Shield,
	Star,
	Stethoscope,
	User,
	Users,
} from "lucide-react";

// শুধু যে icon লাগে সেগুলোই import → পুরো lucide library bundle-এ ঢোকে না
const navIcons = {
	Activity,
	Calendar,
	CalendarClock,
	ClipboardList,
	Clock,
	CreditCard,
	FileText,
	Hospital,
	House,
	KeyRound,
	LayoutDashboard,
	Shield,
	Star,
	Stethoscope,
	User,
	Users,
} satisfies Record<string, LucideIcon>;

// নতুন icon লাগলে উপরে import করে navIcons-এ যোগ করো, type নিজেই আপডেট হবে
export type NavIconName = keyof typeof navIcons;

export const getIconComponent = (name: NavIconName): LucideIcon => navIcons[name] ?? CircleHelp;
