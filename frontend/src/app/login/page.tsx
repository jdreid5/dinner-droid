"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

function getSafeNextPath(): string {
	const next = new URLSearchParams(window.location.search).get("next");
	if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
	return next;
}

export default function LoginPage() {
	const router = useRouter();
	const { login } = useAuth();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSubmitting(true);
		try {
			await login(email, password);
		router.push(getSafeNextPath());
			router.refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Login failed");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="max-w-sm mx-auto px-4 py-16">
			<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
				Log In
			</h1>

			<form onSubmit={handleSubmit} className="flex flex-col gap-4">
				<label className="flex flex-col gap-1">
					<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
						Email
					</span>
					<input
						type="email"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
						autoComplete="email"
					/>
				</label>

				<label className="flex flex-col gap-1">
					<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
						Password
					</span>
					<input
						type="password"
						required
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
						autoComplete="current-password"
					/>
				</label>

				{error && (
					<p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/30 rounded-md px-3 py-2">
						{error}
					</p>
				)}

				<button
					type="submit"
					disabled={submitting}
					className="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer"
				>
					{submitting ? "Logging in..." : "Log In"}
				</button>
			</form>

			<p className="text-sm text-gray-500 mt-6 text-center">
				Don&apos;t have an account?{" "}
				<Link
					href="/signup"
					className="text-blue-500 hover:text-blue-600 font-medium"
				>
					Sign up
				</Link>
			</p>
		</div>
	);
}
