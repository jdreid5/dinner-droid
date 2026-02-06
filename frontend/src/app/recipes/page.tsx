import { getRecipes, getSearchedRecipes } from "@/lib/api";
import SearchBar from "./SearchBar";
import { Suspense } from "react";

export default async function RecipesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }>}) {
	const { q } = await searchParams;
	const searchTerm = typeof q === "string" ? q : "";
	const recipes = searchTerm ? await getSearchedRecipes(searchTerm) :await getRecipes();
	
	return (
		<div>
			<div id="search-bar" className="flex justify-center items-center">
				<Suspense>
					<SearchBar />
				</Suspense>
			</div>
			<br />
			<ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
				{recipes.map((recipe) => (
					<li key={recipe.id} className="grid grid-rows-[16rem_4rem_1.5rem] items-center">
						<img src={recipe.imageUrl || ""} alt={recipe.title} className="h-full aspect-square rounded-lg mx-auto"/>
						<h2 className="text-lg text-gray-700 text-center line-clamp-2">{recipe.title}</h2>
						<p className="text-sm text-gray-500 text-center">{recipe.cookMinutes} minutes</p>
					</li>
				))}
			</ul>
		</div>
	)
}