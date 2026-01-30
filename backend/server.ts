import express, { Request, Response } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// ----- Types -----
type StepIn = { n: number; body: string; imageUrl?: string | null };
type IngredientIn = {
	name: string;
	qty?: number | null;
	unit?: string | null;
	altText?: string | null;
	isPantry?: boolean | null;
};
type ImportPayload = {
	title: string;
	sourceUrl?: string | null;
	imageUrl?: string | null;
	tags?: string[];
	servings?: number | null;
	cookMinutes?: number | null;
	calories?: number | null;
	protein?: number | null;
	carbohydrate?: number | null;
	fat?: number | null;
	fibre?: number | null;
	salt?: number | null;
	notes?: string | null;
	steps?: StepIn[];
	ingredients?: IngredientIn[];
};

type StepOut = { n: number; body: string };
type RecipeItemRow = {
	ingredient: { name: string; isPantry: boolean };
	qty: number | null;
	unit: string | null;
	altText: string | null;
};
type RecipeTagRow = { tag: { slug: string } };

// ----- Routes -----
app.post("/api/import", async (req: Request<{}, {}, ImportPayload>, res: Response) => {
	try {
		const b = req.body;

		if (!b || typeof b.title !== "string" || !b.title.trim()) {
		return res
			.status(400)
			.json({ ok: false, error: "title is required (string)" });
		}

		const tags: string[] = Array.from(
			new Set((b.tags ?? []).map((t) => String(t).trim().toLowerCase()))
		);

		const steps: StepIn[] = (b.steps ?? []).map((s) => ({
			n: Number(s.n),
			body: String(s.body ?? "").trim(),
			imageUrl: s.imageUrl ?? null,
		}));

		const ingredients: IngredientIn[] = (b.ingredients ?? []).map((i) => ({
			name: String(i.name ?? "").trim().toLowerCase(),
			qty: typeof i.qty === "number" ? i.qty : null,
			unit: i.unit ? String(i.unit).toLowerCase() : null,
			altText: i.altText ?? null,
			isPantry: !!i.isPantry,
		})).filter(i => i.name.length > 0);

		// 1) Upsert tags
		const tagRows = [];
		for (const slug of tags) {
			const t = await prisma.tag.upsert({
				where: { slug },
				update: {},
				create: { slug, label: slug },
				select: { id: true },
			});
			tagRows.push(t);
		}

		// 2) Upsert ingredients (canonicalised by lower-cased name)
		const ingIds: Record<string, number> = {};
		for (const it of ingredients) {
			const ing = await prisma.ingredient.upsert({
				where: { name: it.name },
				update: { isPantry: !!it.isPantry },
				create: { name: it.name, isPantry: !!it.isPantry },
				select: { id: true },
			});
			ingIds[it.name] = ing.id;
		}

		// 3) Create recipe + steps
		const recipe = await prisma.recipe.create({
			data: {
				title: b.title.trim(),
				sourceUrl: b.sourceUrl ?? null,
				imageUrl: b.imageUrl ?? null,
				servings: b.servings ?? null,
				cookMinutes: b.cookMinutes ?? null,
				calories: b.calories ?? null,
				protein: b.protein ?? null,
				carbohydrate: b.carbohydrate ?? null,
				fat: b.fat ?? null,
				fibre: b.fibre ?? null,
				salt: b.salt ?? null,
				notes: b.notes ?? null,
				steps: {
				create: steps.map((s) => ({
					n: s.n,
					body: s.body,
					imageUrl: s.imageUrl ?? null,
				})),
				},
			},
			select: { id: true, title: true },
		});

		// 4) Link tags
		for (const t of tagRows) {
			await prisma.recipeTag.create({
				data: { recipeId: recipe.id, tagId: t.id },
			});
		}

		// 5) Link ingredients with quantities (dedupe by ingredientId; merge units)
		// requires: `ingredients` (normalised earlier) and `ingIds: Record<string, number>`
		type Group = {
			ingredientId: number;
			qty: number | null;
			unit: string | null;
			altText: string | null;
		};

		const byId = new Map<number, Group>();

		for (const it of ingredients) {
			const ingredientId = ingIds[it.name];
			if (!ingredientId) continue;

			const qtyNum = typeof it.qty === "number" ? it.qty : null;
			const unit = it.unit ?? null;
			const lineText = it.altText ?? (qtyNum != null ? `${qtyNum}${unit ? " " + unit : ""} ${it.name}` : it.name);

			const prev = byId.get(ingredientId);
			if (!prev) {
				byId.set(ingredientId, {
					ingredientId,
					qty: qtyNum,
					unit,
					altText: lineText,
				});
			} else {
				// If units match and both are numeric, sum; otherwise collapse to ambiguous
				if (prev.unit && unit && prev.unit === unit && prev.qty != null && qtyNum != null) {
					prev.qty += qtyNum;
				} else {
					prev.unit = null;
					prev.qty = null;
					prev.altText = prev.altText ? `${prev.altText}; ${lineText}` : lineText;
				}
			}
		}

		// Persist exactly one row per (recipeId, ingredientId) — idempotent via upsert
		for (const g of byId.values()) {
			await prisma.recipeIngredient.upsert({
				where: {
					// This requires composite primary key @@id([recipeId, ingredientId])
					// Prisma exposes it as 'recipeId_ingredientId' on the WhereUniqueInput
					recipeId_ingredientId: {
						recipeId: recipe.id,
						ingredientId: g.ingredientId,
					},
				},
				update: {
					qty: g.qty,
					unit: g.unit,
					altText: g.altText,
				},
				create: {
					recipeId: recipe.id,
					ingredientId: g.ingredientId,
					qty: g.qty,
					unit: g.unit,
					altText: g.altText,
				},
			});
		}

		return res.json({ ok: true, recipeId: recipe.id, title: recipe.title });
	} catch (err: any) {
		console.error(err);
		return res
			.status(500)
			.json({ ok: false, error: err?.message ?? "Server error" });
	}
});

app.get("/api/recipes", async (req: Request, res: Response) => {
	try {
		const limit = Number(req.query.limit) || 16;

		const randomRecipes = await prisma.$queryRaw<
			{ id: number; title: string; imageUrl: string | null, cookMinutes: number | null }[]
		>`SELECT id, title, imageUrl, cookMinutes FROM Recipe ORDER BY RANDOM() LIMIT ${limit}`;

		return res.json(randomRecipes);
	} catch (err: any) {
		console.error(err);
		return res
			.status(500)
			.json({ ok: false, error: err?.message ?? "Server error" });
	}
});

app.get("/api/recipes/:id", async (req: Request, res: Response) => {
	try {
		const id = Number(req.params.id);
		if (isNaN(id)) {
			return res
				.status(400)
				.json({ error: "Invalid recipe ID" });
		}

		const recipe = await prisma.recipe.findUnique({
			where: { id: Number(id) },
			include: {
				steps: { orderBy: { n: "asc" } },
				items: { include: { ingredient: true } },
				tags: { include: { tag: true } }
			}
		});

		if (!recipe) {
			return res.status(404).json({ error: "Recipe not found" });
		}

		return res.json({
			id: recipe.id,
			title: recipe.title,
			sourceUrl: recipe.sourceUrl,
			imageUrl: recipe.imageUrl,
			servings: recipe.servings,
			cookMinutes: recipe.cookMinutes,
			calories: recipe.calories,
			protein: recipe.protein,
			carbohydrate: recipe.carbohydrate,
			fat: recipe.fat,
			fibre: recipe.fibre,
			salt: recipe.salt,
			notes: recipe.notes,
			steps: recipe.steps.map((step: StepOut) => ({
				n: step.n,
				body: step.body,
			})),
			ingredients: recipe.items.map((item: RecipeItemRow) => ({
				name: item.ingredient.name,
				qty: item.qty,
				unit: item.unit,
				altText: item.altText,
				isPantry: item.ingredient.isPantry
			})),
			tags: recipe.tags.map((tag: RecipeTagRow) => tag.tag.slug)
		})
	} catch (err: any) {
		console.error(err);
		return res
			.status(500)
			.json({ ok: false, error: err?.message ?? "Server error" });
	}
});

const PORT = Number(process.env.PORT ?? 3001);
app.listen(PORT, () =>
  	console.log(`Importer API listening on http://localhost:${PORT}`)
);
