import { getRecipes } from "@/lib/api";

export default async function RecipesPage() {
	const recipes = await getRecipes();
	
	return (
		<div>
			<h1>Recipes</h1>
			<div id="search-bar" className="flex justify-center items-center">
				<input type="text" placeholder="Search recipes" className="w-full max-w-md p-2 rounded-3xl border border-gray-300" />
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