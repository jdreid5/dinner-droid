import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
	const allRecipes = await prisma.recipe.findMany({
		select: { id: true, title: true },
		orderBy: [
			{ title: "asc" },
			{ id: "asc" }
		]
	});

	const idsToDelete: number[] = [];

	for (let i = 1; i < allRecipes.length; i++) {
		if (allRecipes[i]!.title === allRecipes[i-1]!.title) {
			idsToDelete.push(allRecipes[i]!.id);
		}
	}

	if (idsToDelete.length > 0) {
		await prisma.recipe.deleteMany({
			where: { id: { in: idsToDelete } }
		});
	}

	console.log(`Deleted ${idsToDelete.length} duplicate recipes`);
}

main().finally(() => {
	prisma.$disconnect();
});