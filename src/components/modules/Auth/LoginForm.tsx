"use client";

import { loginAction } from "@/actions/auth.actions";
import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { type ILoginPayload, loginZodSchema } from "@/zod/auth.validation";
import { useForm } from "@tanstack/react-form";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

const defaultValues: ILoginPayload = { email: "", password: "" };

// submit-এর মুহূর্তে URL থেকে পড়া হয়, তাই render-এর সময় searchParams লাগে না
// এখানে কোনো যাচাই নেই। নিরাপদ কিনা, server action-এর getPostLoginRedirect সেটা check করে।
const getRedirectFromUrl = () => new URLSearchParams(window.location.search).get("redirect") ?? undefined;

export default function LoginForm() {
	const [serverError, setServerError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [isPending, startTransition] = useTransition();

	const form = useForm({
		defaultValues,
		validators: { onChange: loginZodSchema },
		onSubmit: ({ value }) => {
			setServerError(null);
			const redirectPath = getRedirectFromUrl();

			// redirect হয়ে নতুন page না আসা পর্যন্ত isPending true থাকে, তাই double-submit হয় না
			startTransition(async () => {
				const result = await loginAction(value, redirectPath);
				if (result?.success === false) {
					setServerError(result.message);
				}
			});
		},
	});

	return (
		<Card className="mx-auto w-full max-w-md">
			<CardHeader className="text-center">
				<CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
				<CardDescription>Log in to your PH Doc account</CardDescription>
			</CardHeader>

			<CardContent>
				<form
					noValidate
					className="space-y-4"
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						void form.handleSubmit();
					}}
				>
					<form.Field name="email">
						{(field) => (
							<AppField
								field={field}
								label="Email"
								type="email"
								placeholder="you@example.com"
								autoComplete="email"
								inputMode="email"
								autoCapitalize="none"
								spellCheck={false}
								autoFocus
							/>
						)}
					</form.Field>

					<form.Field name="password">
						{(field) => (
							<AppField
								field={field}
								label="Password"
								type={showPassword ? "text" : "password"}
								placeholder="Enter your password"
								autoComplete="current-password"
								endAdornment={
									<Button
										type="button"
										variant="ghost"
										size="icon-sm"
										onClick={() => setShowPassword((prev) => !prev)}
										aria-label={showPassword ? "Hide password" : "Show password"}
										aria-pressed={showPassword}
									>
										{showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
									</Button>
								}
							/>
						)}
					</form.Field>

					<div className="text-right">
						<Link href="/forgot-password" className="text-sm text-primary underline-offset-4 hover:underline">
							Forgot password?
						</Link>
					</div>

					{serverError && (
						<Alert variant="destructive" aria-live="polite">
							<AlertDescription>{serverError}</AlertDescription>
						</Alert>
					)}

					<AppSubmitButton isPending={isPending} pendingLabel="Logging in...">
						Log in
					</AppSubmitButton>
				</form>
			</CardContent>

			<CardFooter className="justify-center border-t pt-4">
				<p className="text-sm text-muted-foreground">
					Don&apos;t have an account?{" "}
					<Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
						Sign up
					</Link>
				</p>
			</CardFooter>
		</Card>
	);
}
