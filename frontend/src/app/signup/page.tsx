"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { Button, Card, Input, SectionHeading } from "@/app/components/ui";

function getSafeNextPath(): string {
	const next = new URLSearchParams(window.location.search).get("next");
	if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
	return next;
}

export default function SignupPage() {
	const router = useRouter();
	const { signup } = useAuth();

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSubmitting(true);
		try {
			await signup(email, password, name || undefined);
		router.push(getSafeNextPath());
			router.refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Signup failed");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-16">
			<Card>
				<SectionHeading className="text-center">Get started</SectionHeading>
				<h1 className="mb-6 mt-1 text-center text-3xl text-ink">Create an Account</h1>

				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<label className="flex flex-col gap-1.5">
						<span className="text-sm font-medium text-ink">Name (optional)</span>
						<Input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							autoComplete="name"
						/>
					</label>

					<label className="flex flex-col gap-1.5">
						<span className="text-sm font-medium text-ink">Email</span>
						<Input
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							autoComplete="email"
						/>
					</label>

					<label className="flex flex-col gap-1.5">
						<span className="text-sm font-medium text-ink">Password</span>
						<Input
							type="password"
							required
							minLength={8}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							autoComplete="new-password"
						/>
						<span className="text-xs text-muted">
							Must be at least 8 characters
						</span>
					</label>

					{error && (
						<p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-400">
							{error}
						</p>
					)}

					<Button type="submit" disabled={submitting} className="w-full">
						{submitting ? "Creating account..." : "Sign Up"}
					</Button>
				</form>

				<p className="mt-6 text-center text-sm text-muted">
					Already have an account?{" "}
					<Link
						href="/login"
						className="font-medium text-accent transition-colors hover:text-accent-hover"
					>
						Log in
					</Link>
				</p>
			</Card>
		</main>
	);
}
