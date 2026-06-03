import Link from "next/link";

const footerLinks = [
	{ href: "/plan", label: "My Plans" },
	{ href: "/recipes", label: "Recipes" },
];

export default function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className="mt-auto border-t border-border bg-surface">
			<div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
				<div className="flex flex-col gap-1">
					<Link
						href="/"
						className="font-serif text-lg font-semibold tracking-tight text-ink"
					>
						Dinner Droid
					</Link>
					<p className="text-sm text-muted">
						Plan meals, browse recipes, generate shopping lists.
					</p>
				</div>

				<nav
					aria-label="Footer"
					className="flex items-center gap-6"
				>
					{footerLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="text-sm font-medium text-muted transition-colors hover:text-ink"
						>
							{link.label}
						</Link>
					))}
				</nav>
			</div>

			<div className="border-t border-border">
				<p className="mx-auto w-full max-w-5xl px-4 py-4 text-xs text-muted sm:px-6">
					&copy; {year} Dinner Droid. All rights reserved.
				</p>
			</div>
		</footer>
	);
}
