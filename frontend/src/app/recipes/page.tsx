import { getRecipes } from "@/lib/api";

export default async function RecipesPage() {
	const recipes = await getRecipes();
	
	return (
		<div>
			<h1>Recipes</h1>
			<br />
			<ul>
				{recipes.map((recipe) => (
					<li key={recipe.id}>
						{recipe.title}
						<br />
						{recipe.cookMinutes} minutes
						<br />
						<img src={recipe.imageUrl || ""} alt={recipe.title} />
					</li>
				))}
			</ul>
		</div>
	)
}