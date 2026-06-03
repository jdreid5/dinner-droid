"use client";

import { useTheme, type Theme } from "@/app/context/ThemeContext";
import { cn } from "./cn";

type Option = {
	value: Theme;
	label: string;
	icon: React.ReactNode;
};

const SunIcon = (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className="h-4 w-4"
		aria-hidden="true"
	>
		<circle cx="12" cy="12" r="4" />
		<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
	</svg>
);

const MoonIcon = (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className="h-4 w-4"
		aria-hidden="true"
	>
		<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
	</svg>
);

const SystemIcon = (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className="h-4 w-4"
		aria-hidden="true"
	>
		<rect x="2" y="3" width="20" height="14" rx="2" />
		<path d="M8 21h8M12 17v4" />
	</svg>
);

const options: Option[] = [
	{ value: "light", label: "Light", icon: SunIcon },
	{ value: "dark", label: "Dark", icon: MoonIcon },
	{ value: "system", label: "System", icon: SystemIcon },
];

export type ThemeToggleProps = {
	className?: string;
};

export default function ThemeToggle({ className }: ThemeToggleProps) {
	const { theme, setTheme } = useTheme();

	return (
		<div
			role="group"
			aria-label="Color theme"
			className={cn(
				"inline-flex items-center gap-0.5 rounded-full border border-border bg-surface p-0.5",
				className,
			)}
		>
			{options.map((option) => {
				const active = theme === option.value;
				return (
					<button
						key={option.value}
						type="button"
						onClick={() => setTheme(option.value)}
						aria-pressed={active}
						aria-label={`${option.label} theme`}
						title={`${option.label} theme`}
						className={cn(
							"inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
							active
								? "bg-accent text-white"
								: "text-muted hover:text-ink hover:bg-background",
						)}
					>
						{option.icon}
					</button>
				);
			})}
		</div>
	);
}
