"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/app/components/ui";

export default function SearchBar() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const [searchTerm, setSearchTerm] = useState(searchParams.get("q") ?? "");
	
	const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	}

	useEffect(() => {
		const timeout = setTimeout(() => {
			const currentParams = searchParams.get("q") ?? "";

			if (currentParams === searchTerm) return;

			const params = new URLSearchParams(searchParams.toString());
			if (searchTerm) {
				params.set("q",searchTerm);
			} else {
				params.delete("q");
			}
			router.replace(`${pathname}?${params.toString()}`);
		}, 300)
		return () => clearTimeout(timeout);
	}, [searchTerm, pathname, router, searchParams])

	return (
		<div className="relative w-full max-w-md">
			<svg
				className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
				viewBox="0 0 20 20"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				<circle cx="9" cy="9" r="6" />
				<path d="m17 17-3.5-3.5" />
			</svg>
			<Input
				type="search"
				value={searchTerm}
				onChange={handleOnChange}
				placeholder="Search recipes"
				aria-label="Search recipes"
				className="rounded-full pl-11"
			/>
		</div>
	)
}
