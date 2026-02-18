"use client";
import { Ingredient } from "@/app/types/recipe";
import { usePortions } from "./PortionContext";

const BASE_PORTIONS = 2;

function scaleQuantity(qty: number | null, portions: number): number | null {
	if (qty === null) return null;
	const scaled = qty * (portions / BASE_PORTIONS);
	return Number.isInteger(scaled) ? scaled : Number(scaled.toFixed(2));
}

export function IngredientsTable({ ingredients }: { ingredients: Ingredient[] }) {
	const { portions } = usePortions();
	return (
		<table>
			<tbody>
				{(ingredients ?? []).map((ingredient) => {
					return (
						<tr key={ingredient.name}>
							<td>{ingredient.name}</td>
							<td>{scaleQuantity(ingredient.qty, portions)}{ingredient.unit}</td>
						</tr>				
					)
				})}
			</tbody>
		</table>
	)
}