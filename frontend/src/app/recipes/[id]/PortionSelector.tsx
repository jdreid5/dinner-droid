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
			<select
				id="portions"
				value={portions}
				onChange={(e) => setPortions(Number(e.target.value))}
				className="rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 text-sm px-2 py-1.5"
			>
				{options.map((option) => (
					<option key={option} value={option}>{option} portions</option>
				))}
			</select>
		</div>
	);
}
