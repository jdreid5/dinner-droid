import { getRecipe } from "@/lib/api";
import type { Recipe } from "@/app/types/recipe";
import PlanBuilder from "./PlanBuilder";

type SelectedRecipe = Pick<Recipe, "id" | "title" | "imageUrl" | "cookMinutes">;

export default async function NewPlanPage({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const { recipeIds } = await searchParams;
	let initialRecipes: SelectedRecipe[] = [];

	if (typeof recipeIds === "string" && recipeIds.trim()) {
		const ids = recipeIds.split(",").map(Number).filter((n) => !isNaN(n));
		const fetched = await Promise.allSettled(ids.map((id) => getRecipe(id)));
		initialRecipes = fetched
			.filter((r): r is PromiseFulfilledResult<Recipe> => r.status === "fulfilled")
			.map((r) => ({
				id: r.value.id,
				title: r.value.title,
				imageUrl: r.value.imageUrl ?? null,
				cookMinutes: r.value.cookMinutes ?? null,
			}));
	}

	return (
		<div className="max-w-5xl mx-auto px-4 py-8">
			<h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
				Create a New Plan
			</h1>
			<PlanBuilder initialRecipes={initialRecipes} />
		</div>
	);
}
