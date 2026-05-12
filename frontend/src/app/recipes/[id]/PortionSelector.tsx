"use client";

import { usePortions } from "./PortionContext";

export function PortionSelector() {
	const { portions, setPortions } = usePortions();
	const options: number[] = [1, 2, 3, 4, 5];

	return (
		<div className="flex items-center gap-3 mb-4">
			<label
				htmlFor="portions"
				className="text-sm font-medium text-gray-600 dark:text-gray-300"
			>
				Portions:
			</label>
			<div className="relative">
				<select
					id="portions"
					value={portions}
					onChange={(e) => setPortions(Number(e.target.value))}
					className="appearance-none rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 text-sm pl-3 pr-9 py-1.5"
				>
					{options.map((option) => (
						<option key={option} value={option}>{option} portions</option>
					))}
				</select>
				<svg
					className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-300"
					aria-hidden="true"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fillRule="evenodd"
						d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
						clipRule="evenodd"
					/>
				</svg>
			</div>
		</div>
	);
}
