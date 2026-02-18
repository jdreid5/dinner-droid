import { getRecipe } from "@/lib/api";

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const recipe = await getRecipe(id);
	
	return (
		<div>
			<h1>{recipe.title}</h1>
			<p>{recipe.cookMinutes} minutes</p>
			<img src={recipe.imageUrl || ""} alt={`aerial photo of ${recipe.title}`} />
			<h2>Ingredients</h2>
			<table>
				<tbody>
					{recipe.ingredients?.map((ingredient) => {
						return (
							<tr key={ingredient.name}>
								<td>{ingredient.name}</td>
								<td>{ingredient.qty}{ingredient.unit}</td>
							</tr>
						)
					})}
				</tbody>
			</table>
			<h2>Steps</h2>
			<ol>
				{recipe.steps?.map((step) => {
					return (
						<li key={step.n}>{step.body}</li>
					)
				})}
			</ol>
			<h2>Nutritional Information</h2>
			<table>
				<tbody>
					<tr>
						<td>Calories</td>
						<td>{recipe.calories}kcal</td>
					</tr>
					<tr>
						<td>Protein</td>
						<td>{recipe.protein}g</td>
					</tr>
					<tr>
						<td>Carbohydrate</td>
						<td>{recipe.carbohydrate}g</td>
					</tr>
					<tr>
						<td>Fat</td>
						<td>{recipe.fat}g</td>
					</tr>
					<tr>
						<td>Fibre</td>
						<td>{recipe.fibre}g</td>
					</tr>
					<tr>
					<td>Salt</td>
						<td>{recipe.salt}g</td>
					</tr>
				</tbody>
			</table>
		</div>
	)
}