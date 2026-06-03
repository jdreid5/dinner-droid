"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Recipe } from "../types/recipe";
import { Badge, Button } from "@/app/components/ui";

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
	const router = useRouter();

	const handleAddToPlan = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		router.push(`/plan/new?recipeIds=${recipe.id}`);
	};

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
			<Button
				variant="ghost"
				size="sm"
				onClick={handleAddToPlan}
				className="mt-2 self-start px-0 text-accent hover:bg-transparent hover:text-accent-hover"
			>
				+ Add to Plan
			</Button>
		</li>
	);
}
