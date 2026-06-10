import type { CollectionCreateSchema } from "typesense/lib/Typesense/Collections";
import { getTypesenseClient } from "./typesenseClient";

export const RECIPE_COLLECTION = "recipes";

export const recipesCollectionSchema: CollectionCreateSchema = {
	name: RECIPE_COLLECTION,
	fields: [
		{ name: "id", type: "string" },
		{ name: "title", type: "string" },
		{ name: "ingredients", type: "string[]" },
	],
};

export async function ensureRecipeCollection(): Promise<void> {
	const client = getTypesenseClient();
	try {
		await client.collections(RECIPE_COLLECTION).retrieve();
	} catch (err: unknown) {
		const httpStatus = (err as { httpStatus?: number }).httpStatus;
		if (httpStatus === 404) {
			await client.collections().create(recipesCollectionSchema);
			return;
		}
		throw err;
	}
}
