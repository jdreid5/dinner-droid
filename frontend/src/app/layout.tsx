import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/context/AuthContext";
import { ThemeProvider } from "@/app/context/ThemeContext";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

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
						<div className="flex min-h-screen flex-col">
							<Navbar />
							{children}
							<Footer />
						</div>
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
