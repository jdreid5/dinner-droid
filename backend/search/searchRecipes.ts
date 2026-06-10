import type { PrismaClient } from "@prisma/client";
import { RECIPE_COLLECTION } from "./recipeCollection";
import type { RecipeSearchDocument } from "./recipeDocument";
import { getTypesenseClient } from "./typesenseClient";

export type RecipeCard = {
	id: number;
	title: string;
	imageUrl: string | null;
	cookMinutes: number | null;
};

export async function searchRecipes(
	prisma: PrismaClient,
	query: string,
	options: { limit?: number } = {},
): Promise<RecipeCard[]> {
	const trimmed = query.trim();
	if (!trimmed) return [];

	const limit = options.limit ?? 100;
	const client = getTypesenseClient();

	const results = await client.collections(RECIPE_COLLECTION).documents().search({
		q: trimmed,
		query_by: "title,ingredients",
		query_by_weights: "3,1",
		num_typos: 2,
		prefix: true,
		per_page: limit,
	});

	const hits = results.hits as { document: RecipeSearchDocument }[] | undefined;
	const ids = (hits ?? [])
		.map((hit) => Number(hit.document.id))
		.filter((id) => !Number.isNaN(id));

	if (ids.length === 0) return [];

	const recipes = await prisma.recipe.findMany({
		where: { id: { in: ids } },
		select: { id: true, title: true, imageUrl: true, cookMinutes: true },
	});

	const byId = new Map(recipes.map((recipe) => [recipe.id, recipe]));

	return ids
		.map((id) => byId.get(id))
		.filter((recipe): recipe is RecipeCard => recipe !== undefined);
}
