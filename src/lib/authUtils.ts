import type { UserRole } from "@/types/auth.types";

// SUPER_ADMIN আর ADMIN একই dashboard ব্যবহার করে
type DashboardRole = Exclude<UserRole, "SUPER_ADMIN">;
export type RouteOwner = DashboardRole | "COMMON";

interface RouteConfig {
	exact: readonly string[];
	pattern: readonly RegExp[];
}

export const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"] as const;

// ক্রম গুরুত্বপূর্ণ: উপরের config আগে মেলানো হয়
// (\/|$) দেওয়ায় "/dashboard-x" আর "/dashboard"-এর সাথে মিলবে না
const protectedRoutes: ReadonlyArray<[RouteOwner, RouteConfig]> = [
	["DOCTOR", { exact: [], pattern: [/^\/doctor\/dashboard(\/|$)/] }],
	["ADMIN", { exact: [], pattern: [/^\/admin\/dashboard(\/|$)/] }],
	["PATIENT", { exact: ["/payment/success"], pattern: [/^\/dashboard(\/|$)/] }],
	["COMMON", { exact: ["/my-profile", "/change-password"], pattern: [] }],
];

const dashboardRoutes: Record<DashboardRole, string> = {
	ADMIN: "/admin/dashboard",
	DOCTOR: "/doctor/dashboard",
	PATIENT: "/dashboard",
};

const toDashboardRole = (role: UserRole): DashboardRole => (role === "SUPER_ADMIN" ? "ADMIN" : role);

const isRouteMatch = (pathname: string, { exact, pattern }: RouteConfig) =>
	exact.includes(pathname) || pattern.some((regex) => regex.test(pathname));

export const isAuthRoute = (pathname: string) => (authRoutes as readonly string[]).includes(pathname);

export const getRouteOwner = (pathname: string): RouteOwner | null => {
	for (const [owner, config] of protectedRoutes) {
		if (isRouteMatch(pathname, config)) return owner;
	}
	return null; // public route
};

export const getDefaultDashboardRoute = (role: UserRole) => dashboardRoutes[toDashboardRole(role)];

export const canAccessRoute = (pathname: string, role: UserRole) => {
	const owner = getRouteOwner(pathname);
	return owner === null || owner === "COMMON" || owner === toDashboardRole(role);
};

const INTERNAL_ORIGIN = "http://internal.invalid";

// শুধু নিজের সাইটের path গ্রহণ করে। "https://evil.com", "//evil.com", "/\evil.com" সব বাতিল।
export const parseInternalPath = (path: unknown): URL | null => {
	if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
		return null;
	}

	try {
		const url = new URL(path, INTERNAL_ORIGIN);
		return url.origin === INTERNAL_ORIGIN ? url : null;
	} catch {
		return null;
	}
};

export const getPostLoginRedirect = (role: UserRole, redirectPath?: unknown): string => {
	const url = parseInternalPath(redirectPath);

	if (url && !isAuthRoute(url.pathname) && canAccessRoute(url.pathname, role)) {
		return `${url.pathname}${url.search}${url.hash}`;
	}

	return getDefaultDashboardRoute(role);
};
