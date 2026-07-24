"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Recipe } from "@/app/types/recipe";
import {
	usePlanDraft,
	type PlanDraftRecipe,
} from "@/app/context/PlanDraftContext";
import { createPlan } from "@/lib/api";
import { Badge, Button, Input, SectionHeading, Textarea } from "@/app/components/ui";

async function searchRecipes(query: string): Promise<Recipe[]> {
	const endpoint = query
		? `/api/searched-recipes?searchTerm=${encodeURIComponent(query)}`
		: `/api/recipes`;
	const res = await fetch(endpoint);
	if (!res.ok) throw new Error("Failed to fetch recipes");
	return res.json();
}

export default function PlanBuilder({
	initialRecipes = [],
}: {
	initialRecipes?: PlanDraftRecipe[];
}) {
	const router = useRouter();
	const {
		recipes: selected,
		notes,
		addRecipe,
		removeRecipe,
		setNotes,
		mergeRecipes,
		clearDraft,
	} = usePlanDraft();

	const [searchTerm, setSearchTerm] = useState("");
	const [results, setResults] = useState<Recipe[]>([]);
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const mergedInitialRef = useRef(false);
	useEffect(() => {
		if (mergedInitialRef.current || initialRecipes.length === 0) return;
		mergedInitialRef.current = true;
		mergeRecipes(initialRecipes);
	}, [initialRecipes, mergeRecipes]);

	const fetchRecipes = useCallback(async (query: string) => {
		setLoading(true);
		try {
			const data = await searchRecipes(query);
			setResults(data);
		} catch {
			setResults([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		const timeout = setTimeout(() => fetchRecipes(searchTerm), 300);
		return () => clearTimeout(timeout);
	}, [searchTerm, fetchRecipes]);

	const handleAddRecipe = (recipe: Recipe) => {
		addRecipe({
			id: recipe.id,
			title: recipe.title,
			imageUrl: recipe.imageUrl ?? null,
			cookMinutes: recipe.cookMinutes ?? null,
		});
	};

	const handleCreate = async () => {
		if (selected.length === 0) return;
		setSubmitting(true);
		setError(null);
		try {
			const plan = await createPlan(
				selected.map((s) => s.id),
				notes || undefined,
			);
			clearDraft();
			router.push(`/plan/${plan.id}`);
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Something went wrong";
			setError(msg);
		} finally {
			setSubmitting(false);
		}
	};

	const hasDraft = selected.length > 0 || notes.trim().length > 0;

	return (
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
			{/* Search panel */}
			<div>
				<Input
					type="text"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					placeholder="Search recipes..."
					className="mb-4"
					autoFocus
				/>

				<div className="flex max-h-[60vh] flex-col gap-1 overflow-y-auto">
					{loading && (
						<p className="py-4 text-center text-sm text-muted">Loading...</p>
					)}
					{!loading && results.length === 0 && (
						<p className="py-4 text-center text-sm text-muted">No recipes found.</p>
					)}
					{!loading &&
						results.map((recipe) => {
							const isSelected = selected.some((s) => s.id === recipe.id);
							return (
								<button
									key={recipe.id}
									type="button"
									onClick={() => handleAddRecipe(recipe)}
									disabled={isSelected}
									className={`flex items-center gap-3 rounded-md px-3 py-2 text-left transition-colors ${
										isSelected
											? "cursor-default opacity-40"
											: "cursor-pointer hover:bg-surface"
									}`}
								>
									{recipe.imageUrl && (
										<img
											src={recipe.imageUrl}
											alt=""
											className="h-10 w-10 flex-shrink-0 rounded object-cover"
										/>
									)}
									<span className="min-w-0 flex-1 text-sm font-medium text-ink">
										{recipe.title}
									</span>
									{recipe.cookMinutes != null && (
										<span className="text-xs tabular-nums text-muted">
											{recipe.cookMinutes} min
										</span>
									)}
									{isSelected ? (
										<Badge variant="secondary">Added</Badge>
									) : (
										<span className="text-xs font-medium text-accent">+ Add</span>
									)}
								</button>
							);
						})}
				</div>
			</div>

			{/* Draft panel */}
			<div className="border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
				<div className="mb-3 flex items-center justify-between gap-2">
					<SectionHeading as="h2" className="mb-0">
						Your Plan ({selected.length})
					</SectionHeading>
					{hasDraft && (
						<button
							type="button"
							onClick={clearDraft}
							className="text-xs font-medium text-muted transition-colors hover:text-red-600 dark:hover:text-red-400"
						>
							Clear draft
						</button>
					)}
				</div>

				{selected.length === 0 ? (
					<p className="py-4 text-sm text-muted">
						Search and add recipes to get started.
					</p>
				) : (
					<ul className="mb-4 flex flex-col gap-2">
						{selected.map((s, i) => (
							<li
								key={s.id}
								className="flex items-center gap-3 rounded-md bg-background px-3 py-2"
							>
								<span className="w-5 text-right text-xs tabular-nums text-muted">
									{i + 1}.
								</span>
								{s.imageUrl && (
									<img
										src={s.imageUrl}
										alt=""
										className="h-9 w-9 flex-shrink-0 rounded object-cover"
									/>
								)}
								<span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
									{s.title}
								</span>
								<button
									type="button"
									onClick={() => removeRecipe(s.id)}
									className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-lg leading-none text-muted transition-colors hover:bg-surface hover:text-red-600 dark:hover:text-red-400"
									aria-label={`Remove ${s.title}`}
								>
									&times;
								</button>
							</li>
						))}
					</ul>
				)}

				<Textarea
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					placeholder="Notes (optional)"
					rows={2}
					className="mb-4 min-h-0"
				/>

				{error && (
					<p className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-400">
						{error}
					</p>
				)}

				<Button
					onClick={handleCreate}
					disabled={submitting || selected.length === 0}
					className="w-full"
				>
					{submitting ? "Creating..." : "Create Plan"}
				</Button>
			</div>
		</div>
	);
}
