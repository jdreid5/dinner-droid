"use client";
import { Ingredient } from "@/app/types/recipe";
import { usePortions } from "./PortionContext";
import { Badge, Card, SectionHeading } from "@/app/components/ui";

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
		<Card className="p-5">
			<SectionHeading as="h2" className="mb-3">
				Ingredients
			</SectionHeading>
			<ul className="flex flex-col divide-y divide-border">
				{nonPantry.map((ingredient) => {
					const qty = scaleQuantity(ingredient.qty, ingredient.isPantry, portions);
					return (
						<li
							key={ingredient.name}
							className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
						>
							<span className="text-sm text-ink">
								{ingredient.name}
							</span>
							<span className="font-mono text-sm tabular-nums text-muted">
								{qty}{ingredient.unit}
							</span>
						</li>
					)
				})}
			</ul>

			{isPantry.length > 0 && (
				<div className="mt-5 border-t border-border pt-5">
					<SectionHeading as="h3" className="mb-3">
						Pantry
					</SectionHeading>
					<div className="flex flex-wrap gap-2">
						{isPantry.map((ingredient) => (
							<Badge key={ingredient.name}>{ingredient.name}</Badge>
						))}
					</div>
				</div>
			)}
		</Card>
	)
}
