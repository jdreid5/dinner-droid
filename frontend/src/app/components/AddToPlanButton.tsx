"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
	usePlanDraft,
	type PlanDraftRecipe,
} from "@/app/context/PlanDraftContext";
import { Button, cn } from "@/app/components/ui";

type AddToPlanButtonProps = {
	recipe: PlanDraftRecipe;
	variant?: "card" | "detail";
	className?: string;
};

export default function AddToPlanButton({
	recipe,
	variant = "card",
	className,
}: AddToPlanButtonProps) {
	const { user, loading: authLoading } = useAuth();
	const { recipes, addRecipe } = usePlanDraft();
	const router = useRouter();
	const [justAdded, setJustAdded] = useState(false);

	const alreadyInDraft = recipes.some((r) => r.id === recipe.id);

	useEffect(() => {
		if (!justAdded) return;
		const timer = window.setTimeout(() => setJustAdded(false), 2000);
		return () => window.clearTimeout(timer);
	}, [justAdded]);

	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (authLoading) return;

		addRecipe({
			id: recipe.id,
			title: recipe.title,
			imageUrl: recipe.imageUrl ?? null,
			cookMinutes: recipe.cookMinutes ?? null,
		});

		if (!user) {
			router.push(`/login?next=${encodeURIComponent("/plan/new")}`);
			return;
		}

		setJustAdded(true);
	};

	const label = alreadyInDraft || justAdded ? "Added" : "+ Add to Plan";

	if (variant === "detail") {
		return (
			<div className={cn("flex flex-wrap items-center gap-3", className)}>
				<Button
					onClick={handleClick}
					disabled={authLoading || alreadyInDraft}
					aria-label={
						alreadyInDraft ? "Already in plan draft" : "Add to plan draft"
					}
				>
					{label}
				</Button>
				{(alreadyInDraft || justAdded) && (
					<Link
						href="/plan/new"
						className="text-sm font-medium text-accent transition-colors hover:text-accent-hover"
					>
						View draft
					</Link>
				)}
			</div>
		);
	}

	return (
		<div className={cn("flex flex-wrap items-center gap-2", className)}>
			<Button
				variant="ghost"
				size="sm"
				onClick={handleClick}
				disabled={authLoading || alreadyInDraft}
				aria-label={
					alreadyInDraft ? "Already in plan draft" : "Add to plan draft"
				}
				className="self-start px-0 text-accent hover:bg-transparent hover:text-accent-hover disabled:opacity-60"
			>
				{label}
			</Button>
			{(alreadyInDraft || justAdded) && (
				<Link
					href="/plan/new"
					className="text-xs font-medium text-muted transition-colors hover:text-accent"
					onClick={(e) => e.stopPropagation()}
				>
					View draft
				</Link>
			)}
		</div>
	);
}
