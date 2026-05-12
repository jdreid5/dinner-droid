"use client";
import { Nutrition } from "@/app/types/recipe";

type Stat = {
	label: string;
	value: number | null | undefined;
	unit: string;
};

export function NutritionalTable({ nutrition }: { nutrition: Nutrition }) {
	const stats: Stat[] = [
		{ label: "Calories", value: nutrition.calories, unit: "kcal" },
		{ label: "Protein", value: nutrition.protein, unit: "g" },
		{ label: "Carbohydrate", value: nutrition.carbohydrate, unit: "g" },
		{ label: "Fat", value: nutrition.fat, unit: "g" },
		{ label: "Fibre", value: nutrition.fibre, unit: "g" },
		{ label: "Salt", value: nutrition.salt, unit: "g" },
	];

	return (
		<div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
			<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
				{stats.map((stat) => (
					<div key={stat.label}>
						<p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
							{stat.label}
						</p>
						<p className="text-lg font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
							{stat.value ?? "—"}{stat.value != null && stat.unit}
						</p>
					</div>
				))}
			</div>
		</div>
	)
}
