export type RecipeWithIngredients = {
	id: number;
	title: string;
	items: { ingredient: { name: string } }[];
};

export type RecipeSearchDocument = {
	id: string;
	title: string;
	ingredients: string[];
};

export function toRecipeDocument(recipe: RecipeWithIngredients): RecipeSearchDocument {
	return {
		id: String(recipe.id),
		title: recipe.title,
		ingredients: recipe.items.map((item) => item.ingredient.name),
	};
}
