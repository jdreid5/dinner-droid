"use client";
import { Ingredient } from "@/app/types/recipe";
import { usePortions } from "./PortionContext";

const BASE_PORTIONS = 2;

function scaleQuantity(qty: number | null, isPantry: boolean, portions: number): number | null {
	const effectiveQty = qty ?? (!isPantry ? 1 : null);
	if (effectiveQty === null) return null;

	const scaled = effectiveQty * (portions / BASE_PORTIONS);
	return Number.isInteger(scaled) ? scaled : Number(scaled.toFixed(2));
}

export function IngredientsTable({ ingredients }: { ingredients: Ingredient[] }) {
	const { portions } = usePortions();
	const isPantry: Ingredient[] = [];
	const nonPantry: Ingredient[] = [];
	for (const ingredient of ingredients) {
		if (ingredient.isPantry) {
			isPantry.push(ingredient);
		}
		else {
			nonPantry.push(ingredient);
		}
	}

	return (
		<div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
			<h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
				Ingredients
			</h2>
			<ul className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
				{nonPantry.map((ingredient) => {
					const qty = scaleQuantity(ingredient.qty, ingredient.isPantry, portions);
					return (
						<li
							key={ingredient.name}
							className="flex items-center justify-between py-2"
						>
							<span className="text-sm text-gray-700 dark:text-gray-200">
								{ingredient.name}
							</span>
							<span className="text-sm text-gray-500 tabular-nums">
								{qty}{ingredient.unit}
							</span>
						</li>
					)
				})}
			</ul>

			{isPantry.length > 0 && (
				<div className="mt-5">
					<h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
						Pantry
					</h3>
					<div className="flex flex-wrap gap-2">
						{isPantry.map((ingredient) => (
							<span
								key={ingredient.name}
								className="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs text-gray-600 dark:text-gray-300"
							>
								{ingredient.name}
							</span>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
