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
			<img src={recipe.imageUrl || ""} alt={`aerial photo of ${recipe.title}`} />
			<PortionProvider>
				<PortionSelector />

				<h2>Ingredients</h2>
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