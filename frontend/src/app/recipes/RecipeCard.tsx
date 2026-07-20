"use client";

import Link from "next/link";
import { Recipe } from "../types/recipe";
import FavouriteButton from "@/app/components/FavouriteButton";
import AddToPlanButton from "@/app/components/AddToPlanButton";
import { Badge } from "@/app/components/ui";

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
	return (
		<li className="group flex flex-col">
			<Link
				href={`/recipes/${recipe.id}`}
				className="flex flex-1 flex-col rounded-xl outline-none transition-transform duration-200 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
			>
				<div className="overflow-hidden rounded-xl border border-border bg-surface">
					<img
						src={recipe.imageUrl || ""}
						alt={recipe.title}
						className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
					/>
				</div>
				<h2 className="mt-3 line-clamp-2 font-serif text-base font-semibold leading-snug text-ink sm:text-lg">
					{recipe.title}
				</h2>
				{recipe.cookMinutes != null && (
					<div className="mt-2">
						<Badge>{recipe.cookMinutes} min</Badge>
					</div>
				)}
			</Link>
			<div className="mt-2 flex flex-wrap items-center gap-3">
				<AddToPlanButton
					recipe={{
						id: recipe.id,
						title: recipe.title,
						imageUrl: recipe.imageUrl ?? null,
						cookMinutes: recipe.cookMinutes ?? null,
					}}
					variant="card"
				/>
				<FavouriteButton recipeId={recipe.id} size="sm" />
			</div>
		</li>
	);
}
