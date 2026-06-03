"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

export type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
	/** The user's stored preference. */
	theme: Theme;
	/** The theme actually applied to the document ("light" | "dark"). */
	resolvedTheme: "light" | "dark";
	setTheme: (theme: Theme) => void;
};

const STORAGE_KEY = "theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemPrefersDark(): boolean {
	if (typeof window === "undefined") return false;
	return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolve(theme: Theme): "light" | "dark" {
	if (theme === "dark") return "dark";
	if (theme === "light") return "light";
	return systemPrefersDark() ? "dark" : "light";
}

/**
 * Apply the given preference to <html>. We toggle both `.dark` and `.light`
 * so the guarded `@media (prefers-color-scheme: dark)` block in globals.css
 * only ever applies when no manual choice is present (i.e. system mode).
 */
function applyTheme(theme: Theme): "light" | "dark" {
	const resolved = resolve(theme);
	const root = document.documentElement;
	root.classList.toggle("dark", resolved === "dark");
	// In system mode we leave `.light` off so the media query can take over
	// (and so a no-JS fallback still tracks the system preference).
	root.classList.toggle("light", theme === "light");
	return resolved;
}

function readStoredTheme(): Theme {
	if (typeof window === "undefined") return "system";
	const stored = window.localStorage.getItem(STORAGE_KEY);
	if (stored === "light" || stored === "dark" || stored === "system") {
		return stored;
	}
	return "system";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	// Lazy initializers read the value the no-FOUC script already applied,
	// avoiding a synchronous setState in an effect on mount.
	const [theme, setThemeState] = useState<Theme>(readStoredTheme);
	const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() =>
		resolve(readStoredTheme()),
	);

	// Track system changes while in system mode.
	useEffect(() => {
		if (theme !== "system") return;
		const mql = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => setResolvedTheme(applyTheme("system"));
		mql.addEventListener("change", onChange);
		return () => mql.removeEventListener("change", onChange);
	}, [theme]);

	const setTheme = useCallback((next: Theme) => {
		setThemeState(next);
		window.localStorage.setItem(STORAGE_KEY, next);
		setResolvedTheme(applyTheme(next));
	}, []);

	return (
		<ThemeContext value={{ theme, resolvedTheme, setTheme }}>
			{children}
		</ThemeContext>
	);
}

export function useTheme(): ThemeContextValue {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
	return ctx;
}
