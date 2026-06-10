import type { PrismaClient } from "@prisma/client";
import { RECIPE_COLLECTION } from "./recipeCollection";
import { getTypesenseClient } from "./typesenseClient";

export async function warnIfSearchIndexEmpty(prisma: PrismaClient): Promise<void> {
	try {
		const client = getTypesenseClient();
		const collection = await client.collections(RECIPE_COLLECTION).retrieve();
		const indexedCount = collection.num_documents ?? 0;
		if (indexedCount > 0) return;

		const dbCount = await prisma.recipe.count();
		if (dbCount > 0) {
			console.warn(
				`Typesense index is empty but the database has ${dbCount} recipes. Run: npm run search:reindex`,
			);
		}
	} catch (err) {
		console.warn("Typesense unavailable at startup; search will fail until it is running:", err);
	}
}
