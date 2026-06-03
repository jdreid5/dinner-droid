import Link from "next/link";
import { getRecipe } from "@/lib/api";
import { IngredientsTable } from "./IngredientsTable";
import { NutritionalTable } from "./NutritionalTable";
import { PortionProvider } from "./PortionContext";
import { PortionSelector } from "./PortionSelector";
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
							{recipe.servings != null && (
								<Badge variant="secondary">Serves {recipe.servings}</Badge>
							)}
						</div>
						<Link
							href={`/plan/new?recipeIds=${recipe.id}`}
							className="mt-6 inline-flex items-center justify-center gap-2 self-start rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
						>
							+ Add to Plan
						</Link>
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
						<ol className="flex flex-col gap-4">
							{recipe.steps?.map((step) => (
								<li key={step.n} className="flex gap-4">
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
