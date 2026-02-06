"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

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
		<input 
			type="text"
			value={searchTerm}
			onChange={handleOnChange}
			placeholder="Search recipes"
			className="w-full max-w-md p-2 rounded-3xl border border-gray-300"
		/>
	)
}