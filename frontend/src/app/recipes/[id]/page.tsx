import Link from "next/link";
import { getRecipe } from "@/lib/api";
import { IngredientsTable } from "./IngredientsTable";
import { NutritionalTable } from "./NutritionalTable";
import { PortionProvider } from "./PortionContext";
import { PortionSelector } from "./PortionSelector";

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const recipe = await getRecipe(id);
	
	return (
		<div>
			<h1>{recipe.title}</h1>
			<p>{recipe.cookMinutes} minutes</p>
			<Link
				href={`/plan/new?recipeIds=${recipe.id}`}
				className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors mb-4"
			>
				+ Add to Plan
			</Link>
			<img src={recipe.imageUrl || ""} alt={`aerial photo of ${recipe.title}`} />
			<PortionProvider>
				<PortionSelector />

				<IngredientsTable ingredients={recipe.ingredients || []} />

				<h2>Steps</h2>
				<ol>
					{recipe.steps?.map((step) => {
						return (
							<li key={step.n}>{step.body}</li>
						)
					})}
				</ol>

				<h2>Nutritional Information (per portion)</h2>
				<NutritionalTable nutrition={{
					calories: recipe.calories,
					protein: recipe.protein,
					carbohydrate: recipe.carbohydrate,
					fat: recipe.fat,
					fibre: recipe.fibre,
					salt: recipe.salt,
				}} />
			</PortionProvider>
		</div>
	)
}