import { getRecipe } from "@/lib/api";
import { IngredientsTable } from "./IngredientsTable";
import { NutritionalTable } from "./NutritionalTable";
import { PortionProvider } from "./PortionContext";
import { PortionSelector } from "./PortionSelector";
import AddToPlanButton from "@/app/components/AddToPlanButton";
import FavouriteButton from "@/app/components/FavouriteButton";
import { Badge, PageContainer, SectionHeading } from "@/app/components/ui";

function formatStepBody(body: string) {
	return body.charAt(0) + body.slice(1).replace(/([A-Z])/g, "$1");
}

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const recipe = await getRecipe(id);

	return (
		<PageContainer>
			<PortionProvider>
				<div className="mb-10 grid gap-6 md:grid-cols-2 md:gap-8">
					<img
						src={recipe.imageUrl || ""}
						alt={`aerial photo of ${recipe.title}`}
						className="w-full rounded-xl border border-border object-cover aspect-[4/3]"
					/>
					<div className="flex flex-col justify-center">
						<SectionHeading className="mb-3 text-accent">Recipe</SectionHeading>
						<h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
							{recipe.title}
						</h1>
						<div className="mt-5 flex flex-wrap gap-2">
							{recipe.cookMinutes != null && (
								<Badge>{recipe.cookMinutes} minutes</Badge>
							)}
						</div>
						<div className="mt-6 flex flex-wrap items-center gap-3">
							<AddToPlanButton
								recipe={{
									id: recipe.id,
									title: recipe.title,
									imageUrl: recipe.imageUrl ?? null,
									cookMinutes: recipe.cookMinutes ?? null,
								}}
								variant="detail"
							/>
							<FavouriteButton recipeId={recipe.id} />
						</div>
					</div>
				</div>

				<div className="mb-10 grid gap-8 md:grid-cols-3">
					<div className="md:col-span-1">
						<PortionSelector />
						<IngredientsTable ingredients={recipe.ingredients || []} />
					</div>
					<div className="md:col-span-2">
						<SectionHeading as="h2" className="mb-4">
							Method
						</SectionHeading>
						<ol className="flex flex-col divide-y divide-border">
							{recipe.steps?.map((step) => (
								<li key={step.n} className="flex gap-4 py-4 first:pt-0 last:pb-0">
									<span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accent font-serif text-sm font-semibold text-white">
										{step.n}
									</span>
									<p className="pt-1.5 text-sm leading-relaxed whitespace-pre-line text-ink">
										{formatStepBody(step.body)}
									</p>
								</li>
							))}
						</ol>
					</div>
				</div>

				<div>
					<SectionHeading as="h2" className="mb-4">
						Nutritional Information (per portion)
					</SectionHeading>
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
		</PageContainer>
	)
}
