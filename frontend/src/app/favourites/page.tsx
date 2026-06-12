import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError, getFavourites } from "@/lib/api";
import RecipeCard from "@/app/recipes/RecipeCard";
import { PageContainer, SectionHeading } from "@/app/components/ui";
import type { Recipe } from "@/app/types/recipe";

export default async function FavouritesPage() {
	const cookieStore = await cookies();
	if (!cookieStore.get("dd_session")) {
		redirect(`/login?next=${encodeURIComponent("/favourites")}`);
	}

	let favourites = [] as Awaited<ReturnType<typeof getFavourites>>;
	let loadError: string | null = null;
	try {
		favourites = await getFavourites();
	} catch (error) {
		if (error instanceof ApiError && error.status === 401) {
			redirect(`/login?next=${encodeURIComponent("/favourites")}`);
		}
		loadError = error instanceof Error ? error.message : "Failed to load favourites.";
	}

	const recipes: Recipe[] = favourites.map((fav) => ({
		id: fav.id,
		title: fav.title,
		imageUrl: fav.imageUrl,
		cookMinutes: fav.cookMinutes,
	}));

	return (
		<PageContainer>
			<header className="mb-8">
				<SectionHeading>Your kitchen</SectionHeading>
				<h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
					Favourites
				</h1>
			</header>

			{loadError ? (
				<p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-400">
					{loadError}
				</p>
			) : recipes.length > 0 ? (
				<ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
					{recipes.map((recipe) => (
						<RecipeCard key={recipe.id} recipe={recipe} />
					))}
				</ul>
			) : (
				<div className="mx-auto max-w-md py-16 text-center">
					<p className="font-serif text-xl text-ink">No favourites yet</p>
					<p className="mt-2 text-sm text-muted">
						Browse recipes and tap the heart to save your favourites here.
					</p>
					<Link
						href="/recipes"
						className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
					>
						Browse Recipes
					</Link>
				</div>
			)}
		</PageContainer>
	);
}
