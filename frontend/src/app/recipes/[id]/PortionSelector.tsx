"use client";

import { usePortions } from "./PortionContext";
import { Select } from "@/app/components/ui";

export function PortionSelector() {
	const { portions, setPortions } = usePortions();
	const options: number[] = [1, 2, 3, 4, 5];

	return (
		<div className="mb-4 flex items-center gap-3">
			<label
				htmlFor="portions"
				className="text-sm font-medium text-muted"
			>
				Portions
			</label>
			<Select
				id="portions"
				value={portions}
				onChange={(e) => setPortions(Number(e.target.value))}
				className="w-auto"
			>
				{options.map((option) => (
					<option key={option} value={option}>{option} portions</option>
				))}
			</Select>
		</div>
	);
}
