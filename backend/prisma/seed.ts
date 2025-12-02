import { PrismaClient } from "@prisma/client";
import * as fs from "fs";

const prisma = new PrismaClient();

type InputRecipe = {
	title: string;
	sourceUrl?: string;
	goustoId?: string;
	tags?: string[];
	servings?: number;
	cookMinutes?: number;
	calories?: number;
	protein?: number;
	carbohydrate?: number;
	fat?: number;
	fibre?: number;
	salt?: number;
	notes?: string;
	steps: { n: number; body: string; imageUrl?: string }[];
	ingredients: { name: string; qty?: number; unit?: string; altText?: string; isPantry?: boolean }[];
}

async function upsertTag(slug: string) {
	return prisma.tag.upsert({
		where: { slug },
		update: {},
		create: { slug, label: slug }
	});
}

async function main() {
	// 1) Read JSON file
	const raw = fs.readFileSync("./prisma/recipes.json", "utf8");
	const data: InputRecipe[] = JSON.parse(raw);

	// 2) Ensure tags exist
	const allTags = new Map<string, number>();
	const tagSlugs = [...new Set(data.flatMap(r => r.tags ?? []))]
	for (const slug of tagSlugs) {
		const t = await upsertTag(slug);
		allTags.set(slug, t.id);
	}

	// 3) Upsert recipes
	for (const r of data) {
		// normalise ingredient names
		const ingIds: Record<string, number> = {};
		for (const it of r.ingredients) {
			const key = it.name.trim().toLowerCase();
			const ing = await prisma.ingredient.upsert({
				where: { name: key },
				update: { isPantry: !!it.isPantry },
				create: { name: key, isPantry: !!it.isPantry },
				select: { id: true }
			});
			ingIds[key] = ing.id;
		}

		const recipe = await prisma.recipe.create({
			data: {
				title: r.title,
				sourceUrl: r.sourceUrl ?? null,
				goustoId: r.goustoId ?? null,
				servings: r.servings ?? null,
				cookMinutes: r.cookMinutes ?? null,
				calories: r.calories ?? null,
				protein: r.protein ?? null,
				carbohydrate: r.carbohydrate ?? null,
				fat: r.fat ?? null,
				fibre: r.fibre ?? null,
				salt: r.salt ?? null,
				notes: r.notes ?? null,
				steps: { create: r.steps.map(s => ({ n: s.n, body: s.body, imageUrl: s.imageUrl ?? null})) }
			},
			select: { id: true }
		});

		// link tags
		for (const slug of r.tags ?? []) {
			const tagId = allTags.get(slug)!;
			await prisma.recipeTag.create({ data: { recipeId: recipe.id, tagId } });
		}

		// link ingredients with quantities
		for (const it of r.ingredients) {
			const key = it.name.trim().toLowerCase();
			const ingredientId = ingIds[key];
			if (!ingredientId) {
				throw new Error(`No ingredientId found for "${key}"`);
			}
			await prisma.recipeIngredient.create({
				data: {
					recipeId: recipe.id,
					ingredientId,
					qty: it.qty ?? null,
					unit: (it.unit ? it.unit.toLowerCase() : null),
					altText: it.altText ?? null
				}
			});
		}
	}

	console.log("Seed complete");
}

main().finally(async () => prisma.$disconnect());