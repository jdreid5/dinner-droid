"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Button, ThemeToggle, cn } from "@/app/components/ui";

const navLinks = [
	{ href: "/plan", label: "My Plans" },
	{ href: "/recipes", label: "Recipes" },
];

export default function Navbar() {
	const { user, loading, logout } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	const [drawerOpen, setDrawerOpen] = useState(false);
	const [lastPathname, setLastPathname] = useState(pathname);
	const hamburgerRef = useRef<HTMLButtonElement>(null);
	const drawerRef = useRef<HTMLDivElement>(null);

	// Close the drawer whenever the route changes. Adjusting state during render
	// (rather than in an effect) is the React-recommended pattern here.
	if (pathname !== lastPathname) {
		setLastPathname(pathname);
		setDrawerOpen(false);
	}

	const handleLogout = async () => {
		try {
			await logout();
			router.push("/");
			router.refresh();
		} catch {
			// silently ignore – the cookie is likely already gone
		}
	};

	// Lock body scroll, handle Escape, and move focus into the drawer while open.
	useEffect(() => {
		if (!drawerOpen) return;

		const { overflow } = document.body.style;
		document.body.style.overflow = "hidden";

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setDrawerOpen(false);
		};
		document.addEventListener("keydown", onKeyDown);

		// Move focus to the first focusable element inside the drawer.
		const focusable = drawerRef.current?.querySelector<HTMLElement>(
			'a, button, [tabindex]:not([tabindex="-1"])',
		);
		focusable?.focus();

		return () => {
			document.body.style.overflow = overflow;
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [drawerOpen]);

	const closeDrawer = () => {
		setDrawerOpen(false);
		// Return focus to the control that opened the drawer.
		hamburgerRef.current?.focus();
	};

	const linkClasses =
		"text-sm font-medium text-muted transition-colors hover:text-ink";

	// Button-styled links (Button renders a <button>, so we can't nest a <Link>
	// inside it without producing invalid HTML — style the anchor instead).
	const btnBase =
		"inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";
	const btnPrimary = `${btnBase} bg-accent text-white hover:bg-accent-hover`;
	const btnOutline = `${btnBase} border border-border bg-transparent text-ink hover:bg-surface`;

	return (
		<header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
			<nav className="mx-auto flex w-full max-w-5xl items-center gap-6 px-4 py-3 sm:px-6">
				<Link
					href="/"
					className="mr-auto font-serif text-xl font-semibold tracking-tight text-ink"
				>
					Dinner Droid
				</Link>

				{/* Desktop navigation */}
				<div className="hidden items-center gap-6 md:flex">
					{navLinks.map((link) => (
						<Link key={link.href} href={link.href} className={linkClasses}>
							{link.label}
						</Link>
					))}

					{!loading &&
						(user ? (
							<>
								<span className="text-sm text-muted">
									{user.name ?? user.email}
								</span>
								<button
									onClick={handleLogout}
									className={cn(linkClasses, "cursor-pointer")}
								>
									Log Out
								</button>
							</>
						) : (
							<>
								<Link href="/login" className={linkClasses}>
									Log In
								</Link>
								<Link
									href="/signup"
									className={cn(btnPrimary, "px-3 py-1.5 text-sm")}
								>
									Sign Up
								</Link>
							</>
						))}

					<ThemeToggle />
				</div>

				{/* Mobile / tablet hamburger */}
				<button
					ref={hamburgerRef}
					type="button"
					onClick={() => setDrawerOpen(true)}
					aria-label="Open menu"
					aria-expanded={drawerOpen}
					aria-controls="mobile-nav-drawer"
					className="inline-flex h-10 w-10 items-center justify-center rounded-md text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden"
				>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="h-5 w-5"
						aria-hidden="true"
					>
						<path d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</button>
			</nav>

			{/* Mobile / tablet drawer */}
			{drawerOpen && (
				<div className="md:hidden">
					{/* Backdrop */}
					<button
						type="button"
						aria-label="Close menu"
						tabIndex={-1}
						onClick={closeDrawer}
						className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm"
					/>

					{/* Panel */}
					<div
						ref={drawerRef}
						id="mobile-nav-drawer"
						role="dialog"
						aria-modal="true"
						aria-label="Navigation menu"
						className="fixed inset-y-0 right-0 z-50 flex w-72 max-w-[80vw] flex-col gap-6 border-l border-border bg-surface p-6 shadow-xl"
					>
						<div className="flex items-center justify-between">
							<span className="font-serif text-lg font-semibold text-ink">
								Menu
							</span>
							<button
								type="button"
								onClick={closeDrawer}
								aria-label="Close menu"
								className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-background hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
							>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="h-5 w-5"
									aria-hidden="true"
								>
									<path d="M18 6 6 18M6 6l12 12" />
								</svg>
							</button>
						</div>

						<div className="flex flex-col gap-1">
							{navLinks.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									className="rounded-md px-2 py-2 text-base font-medium text-ink transition-colors hover:bg-background"
								>
									{link.label}
								</Link>
							))}
						</div>

						{!loading && (
							<div className="flex flex-col gap-3 border-t border-border pt-6">
								{user ? (
									<>
										<span className="px-2 text-sm text-muted">
											{user.name ?? user.email}
										</span>
										<Button
											variant="outline"
											onClick={handleLogout}
											className="w-full"
										>
											Log Out
										</Button>
									</>
								) : (
									<>
										<Link
											href="/login"
											className={cn(btnOutline, "w-full px-4 py-2 text-sm")}
										>
											Log In
										</Link>
										<Link
											href="/signup"
											className={cn(btnPrimary, "w-full px-4 py-2 text-sm")}
										>
											Sign Up
										</Link>
									</>
								)}
							</div>
						)}

						<div className="mt-auto flex items-center justify-between border-t border-border pt-6">
							<span className="text-sm text-muted">Theme</span>
							<ThemeToggle />
						</div>
					</div>
				</div>
			)}
		</header>
	);
}
