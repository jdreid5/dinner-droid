import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { ensureRecipeCollection, RECIPE_COLLECTION } from "./recipeCollection";
import { toRecipeDocument } from "./recipeDocument";
import { getTypesenseClient } from "./typesenseClient";

const BATCH_SIZE = 500;
const prisma = new PrismaClient();

async function reindexAll(): Promise<void> {
	await ensureRecipeCollection();
	const client = getTypesenseClient();

	let cursor: number | undefined;
	let total = 0;

	while (true) {
		const recipes = await prisma.recipe.findMany({
			take: BATCH_SIZE,
			orderBy: { id: "asc" },
			...(cursor !== undefined ? { cursor: { id: cursor }, skip: 1 } : {}),
			include: { items: { include: { ingredient: true } } },
		});

		if (recipes.length === 0) break;

		const documents = recipes.map(toRecipeDocument);
		const importResults = await client
			.collections(RECIPE_COLLECTION)
			.documents()
			.import(documents, { action: "upsert" });

		const failures = importResults.filter((line: { success: boolean }) => !line.success);
		if (failures.length > 0) {
			console.error("Import failures:", failures.slice(0, 5));
			throw new Error(`Failed to import ${failures.length} documents`);
		}

		total += recipes.length;
		cursor = recipes[recipes.length - 1]!.id;
		console.log(`Indexed ${total} recipes...`);

		if (recipes.length < BATCH_SIZE) break;
	}

	console.log(`Done. Indexed ${total} recipes.`);
}

reindexAll()
	.catch((err) => {
		console.error(err);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
