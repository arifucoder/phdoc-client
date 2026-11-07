import type { UserRole } from "@/types/auth.types";
import type { NavSection } from "@/types/dashboard.types";
import { getDefaultDashboardRoute } from "./authUtils";

export const getCommonNavItems = (role: UserRole): NavSection[] => [
	{
		items: [
			{ title: "Home", href: "/", icon: "House" },
			{ title: "Dashboard", href: getDefaultDashboardRoute(role), icon: "LayoutDashboard" },
			{ title: "My Profile", href: "/my-profile", icon: "User" },
		],
	},
	{
		title: "Settings",
		items: [{ title: "Change Password", href: "/change-password", icon: "KeyRound" }],
	},
];

export const doctorNavItems: NavSection[] = [
	{
		title: "Patient Management",
		items: [
			{ title: "Appointments", href: "/doctor/dashboard/appointments", icon: "Calendar" },
			{ title: "My Schedules", href: "/doctor/dashboard/my-schedules", icon: "Clock" },
			{ title: "Prescriptions", href: "/doctor/dashboard/prescriptions", icon: "FileText" },
			{ title: "My Reviews", href: "/doctor/dashboard/my-reviews", icon: "Star" },
		],
	},
];

export const adminNavItems: NavSection[] = [
	{
		title: "User Management",
		items: [
			{ title: "Admins", href: "/admin/dashboard/admins-management", icon: "Shield" },
			{ title: "Doctors", href: "/admin/dashboard/doctors-management", icon: "Stethoscope" },
			{ title: "Patients", href: "/admin/dashboard/patients-management", icon: "Users" },
		],
	},
	{
		title: "Hospital Management",
		items: [
			{ title: "Appointments", href: "/admin/dashboard/appointments-management", icon: "Calendar" },
			{ title: "Schedules", href: "/admin/dashboard/schedules-management", icon: "Clock" },
			{ title: "Specialties", href: "/admin/dashboard/specialties-management", icon: "Hospital" },
			{ title: "Doctor Schedules", href: "/admin/dashboard/doctor-schedules-management", icon: "CalendarClock" },
			{ title: "Doctor Specialties", href: "/admin/dashboard/doctor-specialties-management", icon: "Stethoscope" },
			{ title: "Payments", href: "/admin/dashboard/payments-management", icon: "CreditCard" },
			{ title: "Prescriptions", href: "/admin/dashboard/prescriptions-management", icon: "FileText" },
			{ title: "Reviews", href: "/admin/dashboard/reviews-management", icon: "Star" },
		],
	},
];

export const patientNavItems: NavSection[] = [
	{
		title: "Appointments",
		items: [
			{ title: "My Appointments", href: "/dashboard/my-appointments", icon: "Calendar" },
			{ title: "Book Appointment", href: "/dashboard/book-appointments", icon: "ClipboardList" },
		],
	},
	{
		title: "Medical Records",
		items: [
			{ title: "My Prescriptions", href: "/dashboard/my-prescriptions", icon: "FileText" },
			{ title: "Health Records", href: "/dashboard/health-records", icon: "Activity" },
		],
	},
];

// Record<UserRole, ...>: নতুন role যোগ হলে এখানে না লিখলে TypeScript error দেবে
const roleNavItems: Record<UserRole, NavSection[]> = {
	SUPER_ADMIN: adminNavItems,
	ADMIN: adminNavItems,
	DOCTOR: doctorNavItems,
	PATIENT: patientNavItems,
};

export const getNavItemsByRole = (role: UserRole): NavSection[] => [...getCommonNavItems(role), ...roleNavItems[role]];
