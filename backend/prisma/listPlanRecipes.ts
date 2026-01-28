import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
	// Find the most recent plan with its recipes
	const plan = await prisma.plan.findFirst({
		orderBy: { createdAt: "desc" },
		include: {
			items: {
				include: {
					recipe: {
						select: {
							title: true,
							cookMinutes: true
						}
					}
				},
				orderBy: { dayIndex: "asc" }
			}
		}
	});

	if (!plan) {
		console.log("No plans found.");
		return;
	}

	console.log(`Plan created: ${plan.createdAt.toLocaleDateString()}\n`);
	console.log("Recipes:");
	console.log("-".repeat(40));

	for (const item of plan.items) {
		const time = item.recipe.cookMinutes ? `${item.recipe.cookMinutes} min` : "? min";
		console.log(`${item.recipe.title} — ${time}`);
	}
}

main().finally(() => prisma.$disconnect());

