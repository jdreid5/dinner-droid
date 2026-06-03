import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getRecipe } from "@/lib/api";
import type { Recipe } from "@/app/types/recipe";
import { PageContainer, SectionHeading } from "@/app/components/ui";
import PlanBuilder from "./PlanBuilder";

type SelectedRecipe = Pick<Recipe, "id" | "title" | "imageUrl" | "cookMinutes">;

export default async function NewPlanPage({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const { recipeIds } = await searchParams;
	const nextPath =
		typeof recipeIds === "string" && recipeIds.trim()
			? `/plan/new?recipeIds=${encodeURIComponent(recipeIds)}`
			: "/plan/new";
	const cookieStore = await cookies();
	if (!cookieStore.get("dd_session")) {
		redirect(`/login?next=${encodeURIComponent(nextPath)}`);
	}
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
		<PageContainer>
			<div className="mb-8">
				<SectionHeading>New meal plan</SectionHeading>
				<h1 className="mt-1 text-3xl text-ink">Create a New Plan</h1>
			</div>
			<PlanBuilder initialRecipes={initialRecipes} />
		</PageContainer>
	);
}
