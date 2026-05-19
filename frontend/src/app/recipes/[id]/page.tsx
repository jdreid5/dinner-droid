import Link from "next/link";
import { getRecipe } from "@/lib/api";
import { IngredientsTable } from "./IngredientsTable";
import { NutritionalTable } from "./NutritionalTable";
import { PortionProvider } from "./PortionContext";
import { PortionSelector } from "./PortionSelector";

function formatStepBody(body: string) {
	return body.charAt(0) + body.slice(1).replace(/([A-Z])/g, "\n$1");
}

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const recipe = await getRecipe(id);

	return (
		<div className="max-w-5xl mx-auto px-4 py-8">
			<PortionProvider>
				<div className="grid md:grid-cols-2 gap-6 mb-8">
					<img
						src={recipe.imageUrl || ""}
						alt={`aerial photo of ${recipe.title}`}
						className="w-full aspect-[4/3] object-cover rounded-xl"
					/>
					<div className="flex flex-col">
						<h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">
							{recipe.title}
						</h1>
						<div className="flex flex-wrap gap-2 mb-5">
							{recipe.cookMinutes != null && (
								<span className="inline-flex items-center gap-2 rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs text-gray-600 dark:text-gray-300">
									{recipe.cookMinutes} minutes
								</span>
							)}
							{recipe.servings != null && (
								<span className="inline-flex items-center gap-2 rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs text-gray-600 dark:text-gray-300">
									Serves {recipe.servings}
								</span>
							)}
						</div>
						<Link
							href={`/plan/new?recipeIds=${recipe.id}`}
							className="self-start inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
						>
							+ Add to Plan
						</Link>
					</div>
				</div>

				<div className="grid md:grid-cols-3 gap-6 mb-8">
					<div className="md:col-span-1">
						<PortionSelector />
						<IngredientsTable ingredients={recipe.ingredients || []} />
					</div>
					<div className="md:col-span-2">
						<h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
							Method
						</h2>
						<ol className="flex flex-col gap-4">
							{recipe.steps?.map((step) => (
								<li
									key={step.n}
									className="flex gap-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4"
								>
									<span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white text-sm font-medium flex-shrink-0">
										{step.n}
									</span>
									<p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line">
										{formatStepBody(step.body)}
									</p>
								</li>
							))}
						</ol>
					</div>
				</div>

				<div>
					<h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
						Nutritional Information (per portion)
					</h2>
					<NutritionalTable nutrition={{
						calories: recipe.calories,
						protein: recipe.protein,
						carbohydrate: recipe.carbohydrate,
						fat: recipe.fat,
						fibre: recipe.fibre,
						salt: recipe.salt,
					}} />
				</div>
			</PortionProvider>
		</div>
	)
}
