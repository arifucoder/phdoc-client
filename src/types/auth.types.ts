export type UserRole = "SUPER_ADMIN" | "ADMIN" | "DOCTOR" | "PATIENT";
export type UserStatus = "ACTIVE" | "BLOCKED" | "DELETED";

export interface IAuthUser {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image: string | null;
	role: UserRole;
	status: UserStatus;
	needPasswordChange: boolean;
	isDeleted: boolean;
	deletedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface ILoginResponse {
	token: string;
	accessToken: string;
	refreshToken: string;
	redirect: boolean;
	url?: string;
	user: IAuthUser;
}

// UI-তে যতটুকু লাগে শুধু ততটুকু (client-এ কম data যায়)
export interface ISessionUser {
	name: string;
	email: string;
	role: UserRole;
}
