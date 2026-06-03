import { getRecipes, getSearchedRecipes } from "@/lib/api";
import SearchBar from "./SearchBar";
import RecipeCard from "./RecipeCard";
import { Recipe } from "../types/recipe";
import { Suspense } from "react";
import { PageContainer, SectionHeading } from "@/app/components/ui";

export default async function RecipesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }>}) {
	const { q } = await searchParams;
	const searchTerm = typeof q === "string" ? q : "";
	const recipes = searchTerm ? await getSearchedRecipes(searchTerm) : await getRecipes();

	const recipeList = recipes.length ? (
		<ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
			{recipes.map((recipe: Recipe) => (
				<RecipeCard key={recipe.id} recipe={recipe} />
			))}
		</ul>
	) : (
		<div className="mx-auto max-w-md py-16 text-center">
			<p className="font-serif text-xl text-ink">No recipes found</p>
			<p className="mt-2 text-sm text-muted">
				{searchTerm
					? `Nothing matched “${searchTerm}”. Try a different ingredient or dish.`
					: "There aren't any recipes to show just yet."}
			</p>
		</div>
	);

	return (
		<PageContainer>
			<header className="mb-8 text-center">
				<SectionHeading className="mb-2">Browse</SectionHeading>
				<h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
					Recipes
				</h1>
			</header>
			<div id="search-bar" className="mb-10 flex items-center justify-center">
				<Suspense>
					<SearchBar />
				</Suspense>
			</div>
			{recipeList}
		</PageContainer>
	)
}
