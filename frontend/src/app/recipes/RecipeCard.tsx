import Link from "next/link";
import { Recipe } from "../types/recipe";

export default function RecipeCard({ recipe }: { recipe: Recipe}) {
	return (
		<li key={recipe.id} className="grid grid-rows-[16rem_4rem_1.5rem] items-center">
			<img src={recipe.imageUrl || ""} alt={recipe.title} className="h-full aspect-square rounded-lg mx-auto"/>
			<h2 className="text-lg text-gray-700 text-center line-clamp-2">{recipe.title}</h2>
			<p className="text-sm text-gray-500 text-center">{recipe.cookMinutes} minutes</p>
		</li>
	)
}