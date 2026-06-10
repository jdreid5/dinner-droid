import type { PrismaClient } from "@prisma/client";
import { ensureRecipeCollection, RECIPE_COLLECTION } from "./recipeCollection";
import { toRecipeDocument } from "./recipeDocument";
import { getTypesenseClient } from "./typesenseClient";

export async function indexRecipe(prisma: PrismaClient, recipeId: number): Promise<void> {
	const recipe = await prisma.recipe.findUnique({
		where: { id: recipeId },
		include: { items: { include: { ingredient: true } } },
	});

	if (!recipe) return;

	await ensureRecipeCollection();

	const client = getTypesenseClient();
	await client
		.collections(RECIPE_COLLECTION)
		.documents()
		.upsert(toRecipeDocument(recipe));
}

export async function indexRecipeSafe(
	prisma: PrismaClient,
	recipeId: number,
): Promise<void> {
	try {
		await indexRecipe(prisma, recipeId);
	} catch (err) {
		console.error(`Failed to index recipe ${recipeId} in Typesense:`, err);
	}
}
