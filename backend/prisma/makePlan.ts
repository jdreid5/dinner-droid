import { PrismaClient } from "@prisma/client";
import prompts from "prompts";

const prisma = new PrismaClient();

const PORTIONS = 3;

async function main() {
	// 1) Fetch all recipes with metadata for display
	const recipes = await prisma.recipe.findMany({
		select: {
			id: true,
			title: true,
			cookMinutes: true,
			calories: true
		},
		orderBy: { title: "asc" }
	});

	if (recipes.length === 0) {
		console.log("No recipes in database.");
		return;
	}

	// 2) Interactive selection loop (type to search, Enter to select, repeat)
	const DONE_VALUE = -1;
	const pick: number[] = [];

	while (true) {
		const available = recipes.filter(r => !pick.includes(r.id));
		
		const choices = [
			{ title: "✓ Done - generate shopping list", value: DONE_VALUE },
			...available.map(r => {
				const time = r.cookMinutes ? `${r.cookMinutes}min` : "?min";
				const cal = r.calories ? `${r.calories} cal` : "? cal";
				return {
					title: `${r.title} (${time}, ${cal})`,
					value: r.id
				};
			})
		];

		const selected = pick.map(id => recipes.find(r => r.id === id)!.title);
		const status = pick.length > 0 
			? `\nSelected (${pick.length}): ${selected.join(", ")}\n` 
			: "";

		const response = await prompts({
			type: "autocomplete",
			name: "recipeId",
			message: `${status}Add a recipe (type to search, Enter to select):`,
			choices,
			suggest: (input, choices) => {
				const lower = input.toLowerCase();
				return Promise.resolve(
					choices.filter(c => c.title.toLowerCase().includes(lower))
				);
			}
		});

		if (response.recipeId === undefined) {
			// User pressed Ctrl+C
			if (pick.length === 0) {
				console.log("No recipes selected. Exiting.");
				return;
			}
			break;
		}

		if (response.recipeId === DONE_VALUE) {
			if (pick.length === 0) {
				console.log("No recipes selected. Exiting.");
				return;
			}
			break;
		}

		pick.push(response.recipeId);
		console.log(`Added: ${recipes.find(r => r.id === response.recipeId)!.title}`);
	}

	// 3) Create plan + items (no order history)
	const plan = await prisma.plan.create({
		data: {
			startsOn: new Date(),
			items: { create: pick.map((id, i) => ({ recipeId: id, dayIndex: i })) }
		},
		select: { id: true }
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
	const scale = PORTIONS / 2;

	for (const it of planWithItems!.items) {
		for (const ri of it.recipe.items) {
			const key = ri.ingredient.name + "|" + (ri.unit ?? "");
			const cur = totals.get(key) ?? { qty: 0, unit: ri.unit ?? null, pantry: ri.ingredient.isPantry };
			totals.set(key, { qty: cur.qty + (ri.qty ?? 0) * scale, unit: cur.unit, pantry: cur.pantry });
		}
	}

	console.log("\n=== Weekly Plan ===");
	for (const it of planWithItems!.items.sort((a, b) => (a.dayIndex ?? 0) - (b.dayIndex ?? 0))) {
		console.log(`- ${it.recipe.title}`);
	}

	console.log("\n=== Shopping List ===");
	for (const [key, v] of totals.entries()) {
		const [name] = key.split("|");
		const u = v.unit || "";
		console.log(`${name}${v.pantry ? " (pantry)" : ""}: ${v.qty || ""} ${u}`.trim());
	}
}

main().finally(() => prisma.$disconnect());
