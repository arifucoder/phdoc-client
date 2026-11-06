import type { UserRole, UserStatus } from "@/types/auth.types";
import jwt, { type JwtPayload } from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET) {
	throw new Error("ACCESS_TOKEN_SECRET is not defined in environment variables");
}

// backend-এর generateAuthTokens()-এর payload-এর সাথে মিল রাখো
export interface IAccessTokenPayload extends JwtPayload {
	userId: string;
	role: UserRole;
	name: string;
	email: string;
	status: UserStatus;
	isDeleted: boolean;
	emailVerified: boolean;
	needPasswordChange?: boolean; // পুরনো token-এ না-ও থাকতে পারে
}

const USER_ROLES: readonly UserRole[] = ["SUPER_ADMIN", "ADMIN", "DOCTOR", "PATIENT"];

// signature + মেয়াদ দুটোই check করে। ভুল হলে null (throw করে না)
export const verifyAccessToken = (token: string): IAccessTokenPayload | null => {
	try {
		// algorithms pin করা: "alg: none" বা অন্য algorithm দিয়ে জাল token বাতিল
		const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET, { algorithms: ["HS256"] });

		if (typeof decoded === "string" || !USER_ROLES.includes(decoded.role)) {
			return null;
		}

		return decoded as IAccessTokenPayload;
	} catch {
		return null;
	}
};

// decode শুধু payload পড়ে, signature verify করে না। এখানে শুধু exp জানা দরকার।
export const getTokenSecondsRemaining = (token: string): number => {
	const payload = jwt.decode(token);

	if (!payload || typeof payload === "string" || typeof payload.exp !== "number") {
		return 0;
	}

	return Math.max(payload.exp - Math.floor(Date.now() / 1000), 0);
};
