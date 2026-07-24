import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/context/AuthContext";
import { PlanDraftProvider } from "@/app/context/PlanDraftContext";
import { ThemeProvider } from "@/app/context/ThemeContext";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import InstallPrompt from "@/app/components/InstallPrompt";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const fraunces = Fraunces({
	variable: "--font-fraunces",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Dinner Droid",
	description: "Plan meals, browse recipes, generate shopping lists",
	applicationName: "Dinner Droid",
	appleWebApp: {
		capable: true,
		title: "Dinner Droid",
		statusBarStyle: "default",
	},
	formatDetection: {
		telephone: false,
	},
};

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#faf7f2" },
		{ media: "(prefers-color-scheme: dark)", color: "#14110d" },
	],
};

// Runs before paint to avoid a flash of the wrong theme. Mirrors the logic in
// ThemeContext's applyTheme(): toggles `.dark`/`.light` on <html> from the
// stored preference, falling back to the system preference in "system" mode.
const noFoucThemeScript = `(function(){try{var t=localStorage.getItem("theme");var d=document.documentElement;var dark=t==="dark"||((!t||t==="system")&&window.matchMedia("(prefers-color-scheme: dark)").matches);d.classList.toggle("dark",dark);d.classList.toggle("light",t==="light");}catch(e){}})();`;

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: noFoucThemeScript }} />
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} antialiased`}
			>
				<ThemeProvider>
					<AuthProvider>
						<PlanDraftProvider>
							<div className="flex min-h-screen flex-col">
								<Navbar />
								{children}
								<Footer />
							</div>
						</PlanDraftProvider>
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
