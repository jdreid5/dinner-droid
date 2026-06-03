"use client";
import { Nutrition } from "@/app/types/recipe";
import { Card, SectionHeading } from "@/app/components/ui";

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
		<Card className="p-5">
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
				{stats.map((stat) => (
					<div key={stat.label}>
						<SectionHeading className="mb-1">{stat.label}</SectionHeading>
						<p className="font-mono text-lg font-semibold tabular-nums text-ink">
							{stat.value ?? "—"}{stat.value != null && stat.unit}
						</p>
					</div>
				))}
			</div>
		</Card>
	)
}
