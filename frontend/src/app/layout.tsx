import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dinner Droid",
  description: "Plan meals, browse recipes, generate shopping lists",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
		<nav className="flex items-center gap-8 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
			<Link href="/" className="text-xl font-bold text-gray-900 dark:text-gray-100 mr-auto">
				Dinner Droid
			</Link>
			<Link href="/plan" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors">
				My Plans
			</Link>
			<Link href="/recipes" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors">
				Recipes
			</Link>
		</nav>
        {children}
      </body>
    </html>
  );
}
