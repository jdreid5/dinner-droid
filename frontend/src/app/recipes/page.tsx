import { getRecipes, getSearchedRecipes } from "@/lib/api";
import SearchBar from "./SearchBar";
import RecipeCard from "./RecipeCard";
import { Recipe } from "../types/recipe";
import { Suspense } from "react";

export default async function RecipesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }>}) {
	const { q } = await searchParams;
	const searchTerm = typeof q === "string" ? q : "";
	const recipes = searchTerm ? await getSearchedRecipes(searchTerm) : await getRecipes();

	function RenderRecipes () {
		if (recipes.length) {
			return (
				<ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
					{recipes.map((recipe: Recipe) => (
						<RecipeCard key={recipe.id} recipe={recipe} />
					))}
				</ul>
			)
		} else {
			return (
				<p className="text-center text-gray-500">We couldn't find any recipes matching your search. Try something else!</p>
			)
		}
	}

	return (
		<div>
			<div id="search-bar" className="flex justify-center items-center">
				<Suspense>
					<SearchBar />
				</Suspense>
			</div>
			<br />
			<RenderRecipes />
		</div>
	)
}