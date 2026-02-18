import { getRecipe } from "@/lib/api";
import { IngredientsTable } from "./IngredientsTable";
import { NutritionalTable } from "./NutritionalTable";
import { PortionProvider } from "./PortionContext";

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const recipe = await getRecipe(id);
	
	return (
		<div>
			<h1>{recipe.title}</h1>
			<p>{recipe.cookMinutes} minutes</p>
			<img src={recipe.imageUrl || ""} alt={`aerial photo of ${recipe.title}`} />
			<h2>Ingredients</h2>
			<PortionProvider>
				<IngredientsTable ingredients={recipe.ingredients || []} />
			</PortionProvider>
			<h2>Steps</h2>
			<ol>
				{recipe.steps?.map((step) => {
					return (
						<li key={step.n}>{step.body}</li>
					)
				})}
			</ol>
			<h2>Nutritional Information</h2>
			<PortionProvider>
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