"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function Navbar() {
	const { user, loading, logout } = useAuth();
	const router = useRouter();

	const handleLogout = async () => {
		try {
			await logout();
			router.push("/");
			router.refresh();
		} catch {
			// silently ignore – the cookie is likely already gone
		}
	};

	return (
		<nav className="flex items-center gap-8 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
			<Link
				href="/"
				className="text-xl font-bold text-gray-900 dark:text-gray-100 mr-auto"
			>
				Dinner Droid
			</Link>

			<Link
				href="/plan"
				className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
			>
				My Plans
			</Link>
			<Link
				href="/recipes"
				className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
			>
				Recipes
			</Link>

			{!loading && (
				<>
					{user ? (
						<>
							<span className="text-sm text-gray-500 dark:text-gray-400">
								{user.name ?? user.email}
							</span>
							<button
								onClick={handleLogout}
								className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors cursor-pointer"
							>
								Log Out
							</button>
						</>
					) : (
						<>
							<Link
								href="/login"
								className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
							>
								Log In
							</Link>
							<Link
								href="/signup"
								className="text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-md transition-colors"
							>
								Sign Up
							</Link>
						</>
					)}
				</>
			)}
		</nav>
	);
}
