import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";
import {
	hashPassword,
	verifyPassword,
	createSessionToken,
	setSessionCookie,
	clearSessionCookie,
	createAuthMiddleware,
} from "./auth";

const app = express();
const prisma = new PrismaClient();
const authenticate = createAuthMiddleware(prisma);

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(cookieParser());
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

app.get("/api/searched-recipes", async (req: Request, res: Response) => {
	try {
		const searchTerm = String(req.query.searchTerm) || "";
		const limit = 100;

		const searchedRecipes = await prisma.recipe.findMany({
			where: {
				title: {
					contains: searchTerm
				}
			},
			take: limit,
			orderBy: { title: "asc" }
		});

		return res.json(searchedRecipes);
	} catch (err: any) {
		console.error(err);
		return res
			.status(500)
			.json({ ok: false, error: err?.message ?? "Server error"});
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

app.get("/api/plans", async (req: Request, res: Response) => {
	try {
		const plans = await prisma.plan.findMany({
			orderBy: { startsOn: "desc" },
			include: {
				items: {
					include: {
						recipe: {
							select: { id: true, title: true, imageUrl: true, cookMinutes: true }
						}
					},
					orderBy: { dayIndex: "asc" }
				}
			}
		});

		return res.json(plans.map(plan => ({
			id: plan.id,
			startsOn: plan.startsOn.toISOString(),
			notes: plan.notes,
			createdAt: plan.createdAt.toISOString(),
			items: plan.items.map(item => ({
				recipeId: item.recipeId,
				title: item.recipe.title,
				imageUrl: item.recipe.imageUrl,
				cookMinutes: item.recipe.cookMinutes,
				dayIndex: item.dayIndex,
			}))
		})));
	} catch (err: any) {
		console.error(err);
		return res
			.status(500)
			.json({ ok: false, error: err?.message ?? "Server error" });
	}
});

app.get("/api/plans/:id", async (req: Request, res: Response) => {
	try {
		const id = Number(req.params.id);

		if (isNaN(id)) {
			return res
				.status(400)
				.json({ error: "Invalid plan ID" });
		}

		const plan = await prisma.plan.findUnique({
			where: { id },
			include: {
				items: {
					include: {
						recipe: {
							select: { id: true, title: true, imageUrl: true, cookMinutes: true }
						}
					},
					orderBy: { dayIndex: "asc" }
				}
			}
		});

		if (!plan) {
			return res.status(404).json({ error: "Plan not found" });
		}

		return res.json({
			id: plan.id,
			startsOn: plan.startsOn.toISOString(),
			notes: plan.notes,
			createdAt: plan.createdAt.toISOString(),
			items: plan.items.map(item => ({
				recipeId: item.recipeId,
				title: item.recipe.title,
				imageUrl: item.recipe.imageUrl,
				cookMinutes: item.recipe.cookMinutes,
				dayIndex: item.dayIndex,
			}))
		});
	} catch (err: any) {
		console.error(err);
		return res
			.status(500)
			.json({ ok: false, error: err?.message ?? "Server error" });
	}
});

app.post("/api/plans", async (req: Request, res: Response) => {
	try {
		const b = req.body;

		if (!b || !Array.isArray(b.recipeIds) || b.recipeIds.length === 0) {
			return res
				.status(400)
				.json({ error: "recipeIds is required (non-empty array of numbers)" });
		}

		const recipeIds: number[] = b.recipeIds.map(Number);
		const startsOn = b.startsOn ? new Date(b.startsOn) : new Date();

		const plan = await prisma.plan.create({
			data: {
				startsOn,
				notes: b.notes ?? null,
				items: {
					create: recipeIds.map((id, i) => ({ recipeId: id, dayIndex: i }))
				}
			},
			include: {
				items: {
					include: {
						recipe: {
							select: { id: true, title: true, imageUrl: true, cookMinutes: true }
						}
					},
					orderBy: { dayIndex: "asc" }
				}
			}
		});

		return res.json({
			id: plan.id,
			startsOn: plan.startsOn.toISOString(),
			notes: plan.notes,
			createdAt: plan.createdAt.toISOString(),
			items: plan.items.map(item => ({
				recipeId: item.recipeId,
				title: item.recipe.title,
				imageUrl: item.recipe.imageUrl,
				cookMinutes: item.recipe.cookMinutes,
				dayIndex: item.dayIndex,
			}))
		});
	} catch (err: any) {
		console.error(err);
		return res
			.status(500)
			.json({ ok: false, error: err?.message ?? "Server error" });
	}
});

app.delete("/api/plans/:id", async (req: Request, res: Response) => {
	try {
		const id = Number(req.params.id);
		
		if (isNaN(id)) {
			return res
				.status(400)
				.json({ error: "Invalid plan ID" });
		}

		const deletedPlan = await prisma.plan.delete({
			where: { id }
		});

		return res.json({ ok: true, id: deletedPlan.id });
	} catch (err: any) {
		if (err?.code === "P2025") {
			return res.status(404).json({ error: "Plan not found" });
		}

		console.error(err);
		return res
			.status(500)
			.json({ ok: false, error: err?.message ?? "Server error" });
	}
})

app.get("/api/plans/:id/shopping-list", async (req: Request, res: Response) => {
	try {
		const id = Number(req.params.id);
		if (isNaN(id)) {
			return res.status(400).json({ error: "Invalid plan ID" });
		}

		const portions = Number(req.query.portions) || 2;

		const plan = await prisma.plan.findUnique({
			where: { id },
			include: {
				items: {
					include: {
						recipe: {
							include: {
								items: { include: { ingredient: true } }
							}
						}
					}
				}
			}
		});

		if (!plan) {
			return res.status(404).json({ error: "Plan not found" });
		}

		const totals = new Map<string, { qty: number; unit: string | null; isPantry: boolean }>();

		for (const planItem of plan.items) {
			const baseServings = planItem.recipe.servings ?? 2;
			const scale = portions / baseServings;

			for (const ri of planItem.recipe.items) {
				const key = ri.ingredient.name + "|" + (ri.unit ?? "");
				const cur = totals.get(key) ?? { qty: 0, unit: ri.unit ?? null, isPantry: ri.ingredient.isPantry };
				cur.qty += (ri.qty ?? 1) * scale;
				totals.set(key, cur);
			}
		}

		const items = [...totals.entries()].map(([key, v]) => {
			const [name] = key.split("|");
			return {
				name,
				qty: v.qty > 0 ? Math.round(v.qty * 100) / 100 : null,
				unit: v.unit,
				isPantry: v.isPantry,
			};
		});

		return res.json({ items });
	} catch (err: any) {
		console.error(err);
		return res
			.status(500)
			.json({ ok: false, error: err?.message ?? "Server error" });
	}
});

// ----- Auth Routes -----
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.post("/api/auth/signup", async (req: Request, res: Response) => {
	try {
		const { email, password, name } = req.body ?? {};

		if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
			return res.status(400).json({ error: "A valid email is required" });
		}
		if (!password || typeof password !== "string" || password.length < 8) {
			return res.status(400).json({ error: "Password must be at least 8 characters" });
		}

		const existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
		if (existing) {
			return res.status(409).json({ error: "Email already in use" });
		}

		const passwordHash = await hashPassword(password);
		const user = await prisma.user.create({
			data: {
				email: email.trim().toLowerCase(),
				name: name?.trim() || null,
				passwordHash,
			},
			select: { id: true, email: true, name: true },
		});

		const token = await createSessionToken(prisma, user.id, req);
		setSessionCookie(res, token);

		return res.status(201).json({ user });
	} catch (err: any) {
		console.error(err);
		return res.status(500).json({ error: err?.message ?? "Server error" });
	}
});

app.post("/api/auth/login", async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body ?? {};

		if (!email || typeof email !== "string") {
			return res.status(400).json({ error: "Email is required" });
		}
		if (!password || typeof password !== "string") {
			return res.status(400).json({ error: "Password is required" });
		}

		const user = await prisma.user.findUnique({
			where: { email: email.trim().toLowerCase() },
			select: { id: true, email: true, name: true, passwordHash: true },
		});

		if (!user || !user.passwordHash) {
			return res.status(401).json({ error: "Invalid email or password" });
		}

		const valid = await verifyPassword(user.passwordHash, password);
		if (!valid) {
			return res.status(401).json({ error: "Invalid email or password" });
		}

		const token = await createSessionToken(prisma, user.id, req);
		setSessionCookie(res, token);

		return res.json({ user: { id: user.id, email: user.email, name: user.name } });
	} catch (err: any) {
		console.error(err);
		return res.status(500).json({ error: err?.message ?? "Server error" });
	}
});

app.post("/api/auth/logout", authenticate, async (req: Request, res: Response) => {
	try {
		await prisma.session.update({
			where: { id: req.auth!.session.id },
			data: { revokedAt: new Date() },
		});

		clearSessionCookie(res);
		return res.json({ ok: true });
	} catch (err: any) {
		console.error(err);
		return res.status(500).json({ error: err?.message ?? "Server error" });
	}
});

app.get("/api/auth/me", authenticate, async (req: Request, res: Response) => {
	return res.json({ user: req.auth!.user });
});

const PORT = Number(process.env.PORT ?? 3001);
app.listen(PORT, () =>
  	console.log(`Importer API listening on http://localhost:${PORT}`)
);
