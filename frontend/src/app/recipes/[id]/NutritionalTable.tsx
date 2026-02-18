"use client";
import { Nutrition } from "@/app/types/recipe";
import { usePortions } from "./PortionContext";

const BASE_PORTIONS = 2;

function scaleValue(value: number | null | undefined, portions: number): number | null | undefined {
	if (value === null || value === undefined) return null;
	const scaled = value * (portions / BASE_PORTIONS);
	return Number.isInteger(scaled) ? scaled : Number(scaled.toFixed(2));
}

export function NutritionalTable({ nutrition }: { nutrition: Nutrition }) {
	const { portions } = usePortions();

	return (
		<table>
			<tbody>
				<tr>
					<td>Calories</td>
					<td>{scaleValue(nutrition.calories, portions)}kcal</td>
				</tr>
				<tr>
					<td>Protein</td>
					<td>{scaleValue(nutrition.protein, portions)}g</td>
				</tr>
				<tr>
					<td>Carbohydrate</td>
					<td>{scaleValue(nutrition.carbohydrate, portions)}g</td>
				</tr>
				<tr>
					<td>Fat</td>
					<td>{scaleValue(nutrition.fat, portions)}g</td>
				</tr>
				<tr>
					<td>Fibre</td>
					<td>{scaleValue(nutrition.fibre, portions)}g</td>
				</tr>
				<tr>
				<td>Salt</td>
					<td>{scaleValue(nutrition.salt, portions)}g</td>
				</tr>
			</tbody>
		</table>
	)
}