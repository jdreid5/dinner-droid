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
		<div>
			<h2>Ingredients</h2>
			<table>
				<tbody>
					{nonPantry.map((ingredient) => {
						return (
							<tr key={ingredient.name}>
								<td>{ingredient.name}</td>
								<td>{scaleQuantity(ingredient.qty, ingredient.isPantry, portions)}{ingredient.unit}</td>
							</tr>				
						)						
					})}
				</tbody>
			</table>
			Pantry Ingredients
			<p>
				{isPantry.map((ingredient) => {
					if (isPantry.indexOf(ingredient) !== isPantry.length - 1) {
						return (
							<span key={ingredient.name}>{ingredient.name}, </span>
						)
					} else {
						return (
							<span key={ingredient.name}>{ingredient.name}</span>
						)
					}
				})}
			</p>
		</div>
	)
}