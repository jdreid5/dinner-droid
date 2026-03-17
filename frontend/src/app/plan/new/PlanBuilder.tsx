"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Recipe } from "@/app/types/recipe";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

type SelectedRecipe = Pick<Recipe, "id" | "title" | "imageUrl" | "cookMinutes">;

async function searchRecipes(query: string): Promise<Recipe[]> {
	const endpoint = query
		? `${API_BASE}/api/searched-recipes?searchTerm=${encodeURIComponent(query)}`
		: `${API_BASE}/api/recipes`;
	const res = await fetch(endpoint);
	if (!res.ok) throw new Error("Failed to fetch recipes");
	return res.json();
}

async function postPlan(recipeIds: number[], notes?: string) {
	const res = await fetch(`${API_BASE}/api/plans`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ recipeIds, notes }),
	});
	if (!res.ok) {
		const body = await res.text();
		throw new Error(`Failed to create plan (${res.status}): ${body}`);
	}
	return res.json();
}

export default function PlanBuilder({
	initialRecipes = [],
}: {
	initialRecipes?: SelectedRecipe[];
}) {
	const router = useRouter();

	const [searchTerm, setSearchTerm] = useState("");
	const [results, setResults] = useState<Recipe[]>([]);
	const [selected, setSelected] = useState<SelectedRecipe[]>(initialRecipes);
	const [notes, setNotes] = useState("");
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

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

	const addRecipe = (recipe: Recipe) => {
		if (selected.some((s) => s.id === recipe.id)) return;
		setSelected((prev) => [
			...prev,
			{
				id: recipe.id,
				title: recipe.title,
				imageUrl: recipe.imageUrl ?? null,
				cookMinutes: recipe.cookMinutes ?? null,
			},
		]);
	};

	const removeRecipe = (id: number) => {
		setSelected((prev) => prev.filter((s) => s.id !== id));
	};

	const handleCreate = async () => {
		if (selected.length === 0) return;
		setSubmitting(true);
		setError(null);
		try {
			const plan = await postPlan(
				selected.map((s) => s.id),
				notes || undefined,
			);
			router.push(`/plan/${plan.id}`);
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Something went wrong";
			setError(msg);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-[1fr_20rem] gap-6">
			{/* Search panel */}
			<div>
				<input
					type="text"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					placeholder="Search recipes..."
					className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 mb-4"
					autoFocus
				/>

				<div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
					{loading && (
						<p className="text-sm text-gray-400 text-center py-4">Loading...</p>
					)}
					{!loading && results.length === 0 && (
						<p className="text-sm text-gray-400 text-center py-4">No recipes found.</p>
					)}
					{!loading &&
						results.map((recipe) => {
							const isSelected = selected.some((s) => s.id === recipe.id);
							return (
								<button
									key={recipe.id}
									onClick={() => addRecipe(recipe)}
									disabled={isSelected}
									className={`flex items-center gap-3 rounded-md px-3 py-2 text-left transition-colors ${
										isSelected
											? "opacity-40 cursor-default"
											: "hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
									}`}
								>
									{recipe.imageUrl && (
										<img
											src={recipe.imageUrl}
											alt=""
											className="h-10 w-10 rounded object-cover flex-shrink-0"
										/>
									)}
									<span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-200">
										{recipe.title}
									</span>
									{recipe.cookMinutes != null && (
										<span className="text-xs text-gray-400">
											{recipe.cookMinutes} min
										</span>
									)}
									{isSelected ? (
										<span className="text-xs text-green-500">Added</span>
									) : (
										<span className="text-xs text-blue-500">+ Add</span>
									)}
								</button>
							);
						})}
				</div>
			</div>

			{/* Draft panel */}
			<div className="lg:border-l lg:border-gray-200 lg:dark:border-gray-700 lg:pl-6">
				<h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
					Your Plan ({selected.length})
				</h2>

				{selected.length === 0 ? (
					<p className="text-sm text-gray-400 py-4">
						Search and add recipes to get started.
					</p>
				) : (
					<ul className="flex flex-col gap-2 mb-4">
						{selected.map((s, i) => (
							<li
								key={s.id}
								className="flex items-center gap-3 rounded-md bg-gray-50 dark:bg-gray-800 px-3 py-2"
							>
								<span className="text-xs text-gray-400 w-5 text-right">
									{i + 1}.
								</span>
								{s.imageUrl && (
									<img
										src={s.imageUrl}
										alt=""
										className="h-9 w-9 rounded object-cover flex-shrink-0"
									/>
								)}
								<span className="flex-1 font-medium text-gray-700 dark:text-gray-200 text-sm truncate">
									{s.title}
								</span>
								<button
									onClick={() => removeRecipe(s.id)}
									className="text-xs text-red-400 hover:text-red-600"
									aria-label={`Remove ${s.title}`}
								>
									&times;
								</button>
							</li>
						))}
					</ul>
				)}

				<textarea
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					placeholder="Notes (optional)"
					rows={2}
					className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 text-sm mb-4"
				/>

				{error && (
					<p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/30 rounded-md px-3 py-2 mb-4">
						{error}
					</p>
				)}

				<button
					onClick={handleCreate}
					disabled={submitting || selected.length === 0}
					className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-md text-sm font-medium transition-colors"
				>
					{submitting ? "Creating..." : "Create Plan"}
				</button>
			</div>
		</div>
	);
}
