"use client";
import { Nutrition } from "@/app/types/recipe";

export function NutritionalTable({ nutrition }: { nutrition: Nutrition }) {
	return (
		<table>
			<tbody>
				<tr>
					<td>Calories</td>
					<td>{nutrition.calories}kcal</td>
				</tr>
				<tr>
					<td>Protein</td>
					<td>{nutrition.protein}g</td>
				</tr>
				<tr>
					<td>Carbohydrate</td>
					<td>{nutrition.carbohydrate}g</td>
				</tr>
				<tr>
					<td>Fat</td>
					<td>{nutrition.fat}g</td>
				</tr>
				<tr>
					<td>Fibre</td>
					<td>{nutrition.fibre}g</td>
				</tr>
				<tr>
				<td>Salt</td>
					<td>{nutrition.salt}g</td>
				</tr>
			</tbody>
		</table>
	)
}