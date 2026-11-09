import { canAccessRoute, getDefaultDashboardRoute, getRouteOwner, isAuthRoute } from "@/lib/authUtils";
import {
	AUTH_COOKIES,
	getAuthCookieDeleteOptions,
	getAuthCookieOptions,
	SESSION_TOKEN_MAX_AGE,
} from "@/lib/cookieConfig";
import { getTokenSecondsRemaining, type IAccessTokenPayload, verifyAccessToken } from "@/lib/jwtUtils";
import { type NextRequest, NextResponse } from "next/server";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const REFRESH_BEFORE_EXPIRY_SECONDS = 5 * 60; // মেয়াদ শেষের ৫ মিনিট আগেই refresh
const REFRESH_TIMEOUT_MS = 5000; // backend আটকে গেলে পুরো site যেন আটকে না যায়

const ROUTES = {
	login: "/login",
	forgotPassword: "/forgot-password",
	resetPassword: "/reset-password",
	verifyEmail: "/verify-email",
	changePassword: "/change-password",
} as const;

interface IAuthTokens {
	accessToken: string;
	refreshToken: string;
	sessionToken: string;
}

type RefreshResult =
	| { status: "success"; tokens: IAuthTokens }
	| { status: "invalid" } // refresh token/session বাতিল → logout করাতে হবে
	| { status: "error" }; // network/backend সমস্যা → এবার কিছু মুছব না

// ---------- Backend call ----------
const refreshAuthTokens = async (refreshToken: string, sessionToken: string): Promise<RefreshResult> => {
	if (!API_BASE_URL) return { status: "error" };

	try {
		const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
			method: "POST",
			headers: {
				// backend-এর getNewToken দুটো cookie-ই চায়
				Cookie: `${AUTH_COOKIES.refreshToken}=${refreshToken}; ${AUTH_COOKIES.sessionToken}=${sessionToken}`,
			},
			cache: "no-store",
			signal: AbortSignal.timeout(REFRESH_TIMEOUT_MS),
		});

		if (res.status === 401 || res.status === 403) return { status: "invalid" };
		if (!res.ok) return { status: "error" };

		const body = (await res.json()) as { data?: Partial<IAuthTokens> };
		const { accessToken, refreshToken: newRefreshToken, sessionToken: newSessionToken } = body.data ?? {};

		if (!accessToken || !newRefreshToken || !newSessionToken) return { status: "error" };

		return {
			status: "success",
			tokens: { accessToken, refreshToken: newRefreshToken, sessionToken: newSessionToken },
		};
	} catch (error) {
		console.error("[proxy] token refresh failed:", error instanceof Error ? error.message : error);
		return { status: "error" };
	}
};

// ---------- Helpers ----------
const getTokenCookies = (tokens: IAuthTokens) =>
	[
		[AUTH_COOKIES.accessToken, tokens.accessToken, getTokenSecondsRemaining(tokens.accessToken)],
		[AUTH_COOKIES.refreshToken, tokens.refreshToken, getTokenSecondsRemaining(tokens.refreshToken)],
		[AUTH_COOKIES.sessionToken, tokens.sessionToken, SESSION_TOKEN_MAX_AGE],
	] as const;

const redirectToLogin = (request: NextRequest) => {
	const { pathname, search } = request.nextUrl;
	const loginUrl = new URL(ROUTES.login, request.url);
	// login-এর পর getPostLoginRedirect() এটা আবার validate করে (open redirect safe)
	loginUrl.searchParams.set("redirect", `${pathname}${search}`);
	return NextResponse.redirect(loginUrl);
};

// ---------- Main logic ----------
const handleAuth = async (request: NextRequest): Promise<NextResponse> => {
	const { pathname, searchParams } = request.nextUrl;
	const routeOwner = getRouteOwner(pathname);
	const isAuthPage = isAuthRoute(pathname);
	const isPublicPage = routeOwner === null && !isAuthPage;

	const accessToken = request.cookies.get(AUTH_COOKIES.accessToken)?.value;
	const refreshToken = request.cookies.get(AUTH_COOKIES.refreshToken)?.value;
	const sessionToken = request.cookies.get(AUTH_COOKIES.sessionToken)?.value;

	// ⚡ Fast path: কোনো token নেই, public page → কোনো কাজই লাগবে না
	if (!accessToken && !refreshToken && isPublicPage) {
		return NextResponse.next();
	}

	// ১) access token একবারই verify
	let user: IAccessTokenPayload | null = accessToken ? verifyAccessToken(accessToken) : null;
	let newTokens: IAuthTokens | null = null;
	let refreshStatus: RefreshResult["status"] | null = null;

	// ২) token নেই / expired / শীঘ্রই expire → refresh (exp verify-এর payload থেকেই, আবার decode লাগে না)
	const secondsLeft = user?.exp ? user.exp - Math.floor(Date.now() / 1000) : 0;

	if (refreshToken && sessionToken && secondsLeft <= REFRESH_BEFORE_EXPIRY_SECONDS) {
		const result = await refreshAuthTokens(refreshToken, sessionToken);
		refreshStatus = result.status;

		if (result.status === "success") {
			newTokens = result.tokens;
			user = verifyAccessToken(result.tokens.accessToken);
		} else if (result.status === "invalid") {
			user = null; // session revoke হয়েছে (যেমন logout-all)
		}
		// "error" হলে: পুরনো token এখনো valid থাকলে সেটা দিয়েই চলবে
	}

	// ৩) blocked/deleted user-কে বের করে দাও
	if (user && (user.status !== "ACTIVE" || user.isDeleted)) {
		user = null;
		refreshStatus = "invalid";
	}

	// বাসি cookie মুছে দাও, যাতে প্রতিটা request-এ বারবার refresh চেষ্টা না হয়।
	// backend সাময়িক down ("error") হলে মুছি না, নইলে সবাই অকারণে logout হবে।
	const shouldClearCookies = !user && refreshStatus !== "error" && Boolean(accessToken || refreshToken);

	// response-এ cookie বসানো (browser-এর জন্য)
	const finalize = (response: NextResponse) => {
		if (newTokens) {
			for (const [name, value, maxAge] of getTokenCookies(newTokens)) {
				response.cookies.set(name, value, getAuthCookieOptions(maxAge));
			}
		} else if (shouldClearCookies) {
			for (const name of Object.values(AUTH_COOKIES)) response.cookies.delete(getAuthCookieDeleteOptions(name));
		}
		return response;
	};

	// request-এও বসানো, যাতে এই request-এর Server Component/Action নতুন token দেখে
	const next = () => {
		if (newTokens) {
			for (const [name, value] of getTokenCookies(newTokens)) request.cookies.set(name, value);
		} else if (shouldClearCookies) {
			for (const name of Object.values(AUTH_COOKIES)) request.cookies.delete(name);
		}
		return finalize(NextResponse.next({ request: { headers: request.headers } }));
	};

	const redirectTo = (path: string) => finalize(NextResponse.redirect(new URL(path, request.url)));

	// ৪) Public page → সবার জন্য খোলা (token refresh হয়ে থাকলে cookie-ও যাবে)
	if (isPublicPage) return next();

	// ৫) Logged-out user
	if (!user) {
		if (routeOwner !== null) return finalize(redirectToLogin(request));

		// forgot-password থেকে না এলে reset-password-এর মানে নেই
		if (pathname === ROUTES.resetPassword && !searchParams.get("email")) {
			return redirectTo(ROUTES.forgotPassword);
		}

		return next(); // login, register ইত্যাদি
	}

	// ---------- এখান থেকে user নিশ্চিতভাবে logged-in ----------
	const dashboard = getDefaultDashboardRoute(user.role);

	// ৬) Email verify বাধ্যতামূলক
	if (!user.emailVerified) {
		return pathname === ROUTES.verifyEmail
			? next()
			: redirectTo(`${ROUTES.verifyEmail}?email=${encodeURIComponent(user.email)}`);
	}

	// ৭) Password বদলানো বাধ্যতামূলক (তোমার loginAction-ও /change-password-এ পাঠায়)
	if (user.needPasswordChange) {
		return pathname === ROUTES.changePassword ? next() : redirectTo(ROUTES.changePassword);
	}

	// ৮) Logged-in user-এর login/register/verify-email/reset-password-এ কাজ নেই
	if (isAuthPage) return redirectTo(dashboard);

	// ৯) Role check (SUPER_ADMIN → ADMIN, COMMON সবার জন্য: canAccessRoute সামলায়)
	if (!canAccessRoute(pathname, user.role)) return redirectTo(dashboard);

	return next();
};

export async function proxy(request: NextRequest) {
	try {
		return await handleAuth(request);
	} catch (error) {
		console.error("[proxy] unexpected error:", error instanceof Error ? error.message : error);
		// Fail-closed: protected route-এ কোনো সন্দেহ হলে ঢুকতে দেবে না
		return getRouteOwner(request.nextUrl.pathname) === null ? NextResponse.next() : redirectToLogin(request);
	}
}

export const config = {
	matcher: [
		/*
		 * এগুলোতে proxy চলবে না:
		 * api, _next/static, _next/image, metadata file, .well-known,
		 * আর public/ folder-এর static file (ছবি, font ইত্যাদি)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|\\.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|woff2?|ttf|txt|xml)$).*)",
	],
};
