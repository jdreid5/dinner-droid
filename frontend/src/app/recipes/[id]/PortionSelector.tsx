"use client";

import { usePortions } from "./PortionContext";

export function PortionSelector() {
	const { portions, setPortions } = usePortions();
	const options: number[] = [1, 2, 3, 4, 5];

	return (
		<label>
			Portions:
			<select value={portions} onChange={(e) => setPortions(Number(e.target.value))}>
				{options.map((option) => (
					<option key={option} value={option}>{option} portions</option>
				))}
			</select>
		</label>
	);
}