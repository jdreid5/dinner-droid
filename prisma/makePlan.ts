import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const RECIPES_PER_WEEK = 2;
const NO_REPEAT_WEEKS = 6;

function weeksAgoDate(n: number) {
	const d = new Date();
	d.setDate(d.getDate() - n * 7);
	return d;
}

async function main() {
	// 1) Get candidate recipes (exclude recent)
	const cutoff = weeksAgoDate(NO_REPEAT_WEEKS);
	const recent = await prisma.orderHistory.findMany({
		where: { orderedOn: { gte: cutoff } },
		select: { recipeId: true }
	});
	const excludeIds = new Set(recent.map(r => r.recipeId));

	const candidates = await prisma.recipe.findMany({
		select: { id: true },
		orderBy: { createdAt: "desc" }
	});
	const pool = candidates.map(c => c.id).filter(id => !excludeIds.has(id));
	if (pool.length < RECIPES_PER_WEEK) throw new Error("Not enough recipes to choose from");

	// 2) Random sample
	const pick: number[] = [];
	while (pick.length < RECIPES_PER_WEEK) {
		const id: number = pool[Math.floor(Math.random() * pool.length)]!;
		if (!pick.includes(id)) pick.push(id);
	}

	// 3) Create plan + items + write order history
	const plan = await prisma.plan.create({
		data: {
			startsOn: new Date(),
			items: { create: pick.map((id, i) => ({ recipeId: id, dayIndex: i })) }
		},
		select: { id: true }
	});

	await prisma.orderHistory.createMany({
		data: pick.map(id => ({ recipeId: id, orderedOn: new Date() }))
	});

	// 4) Aggregate ingredients = shopping list
	const planWithItems = await prisma.plan.findUnique({
		where: { id: plan.id },
		include: {
			items: {
				include: {
					recipe: {
						include: {
							items: {
								include: {
									ingredient: true
								}
							}
						}
					}
				}
			}
		}
	});

	const totals = new Map<string, { qty: number; unit: string | null; pantry: boolean }>();

	for (const it of planWithItems!.items) {
		for (const ri of it.recipe.items) {
			const key = ri.ingredient.name + "|" + (ri.unit ?? "");
			const cur = totals.get(key) ??  { qty: 0, unit: ri.unit ?? null, pantry: ri.ingredient.isPantry };
			totals.set(key, { qty: cur.qty + (ri.qty ?? 0), unit: cur.unit, pantry: cur.pantry});
		}
	}

	console.log("\n=== Weekly Plan ===");
	for (const it of planWithItems!.items.sort((a, b) => (a.dayIndex ?? 0) - (b.dayIndex ?? 0))) {
		console.log(`- ${it.recipe.title}`);
	}

	console.log("\n=== Shopping List ===");
	for (const [key, v] of totals.entries()) {
		const [name, unit] = key.split("|");
		const u = v.unit || "";
		console.log(`${name}${v.pantry ? " (pantry)" : ""}: ${v.qty || ""} ${u}`.trim());
	}
}

main().finally(() => prisma.$disconnect());