"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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

export default function PlanWizardModal() {
	const router = useRouter();
	const dialogRef = useRef<HTMLDialogElement>(null);

	const [step, setStep] = useState<1 | 2>(1);
	const [searchTerm, setSearchTerm] = useState("");
	const [results, setResults] = useState<Recipe[]>([]);
	const [selected, setSelected] = useState<SelectedRecipe[]>([]);
	const [notes, setNotes] = useState("");
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const open = () => {
		setStep(1);
		setSearchTerm("");
		setSelected([]);
		setNotes("");
		setResults([]);
		setError(null);
		dialogRef.current?.showModal();
	};

	const close = () => {
		dialogRef.current?.close();
	};

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
			await postPlan(
				selected.map((s) => s.id),
				notes || undefined,
			);
			close();
			router.refresh();
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Something went wrong";
			setError(msg);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<>
			<button
				onClick={open}
				className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-md font-medium transition-colors"
			>
				Make a New Plan
			</button>

			<dialog
				ref={dialogRef}
				className="w-full max-w-2xl rounded-xl p-0 backdrop:bg-black/40 bg-white dark:bg-gray-900"
				onClick={(e) => {
					if (e.target === dialogRef.current) close();
				}}
			>
				<div className="p-6">
					{/* Step indicator */}
					<div className="flex items-center gap-2 mb-6">
						<span
							className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
								step === 1
									? "bg-blue-500 text-white"
									: "bg-gray-200 dark:bg-gray-700 text-gray-500"
							}`}
						>
							1
						</span>
						<span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
						<span
							className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
								step === 2
									? "bg-blue-500 text-white"
									: "bg-gray-200 dark:bg-gray-700 text-gray-500"
							}`}
						>
							2
						</span>
					</div>

					{step === 1 && (
						<div>
							<h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
								Select Recipes
							</h2>

							{/* Selected chips */}
							{selected.length > 0 && (
								<div className="flex flex-wrap gap-2 mb-4">
									{selected.map((s) => (
										<span
											key={s.id}
											className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm px-3 py-1"
										>
											{s.title}
											<button
												onClick={() => removeRecipe(s.id)}
												className="ml-1 hover:text-red-500"
												aria-label={`Remove ${s.title}`}
											>
												&times;
											</button>
										</span>
									))}
								</div>
							)}

							{/* Search */}
							<input
								type="text"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder="Search recipes..."
								className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 mb-4"
								autoFocus
							/>

							{/* Results */}
							<div className="max-h-64 overflow-y-auto flex flex-col gap-1">
								{loading && (
									<p className="text-sm text-gray-400 text-center py-4">
										Loading...
									</p>
								)}
								{!loading && results.length === 0 && (
									<p className="text-sm text-gray-400 text-center py-4">
										No recipes found.
									</p>
								)}
								{!loading &&
									results.map((recipe) => {
										const isSelected = selected.some(
											(s) => s.id === recipe.id,
										);
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
														className="h-8 w-8 rounded object-cover flex-shrink-0"
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
													<span className="text-xs text-green-500">
														Added
													</span>
												) : (
													<span className="text-xs text-blue-500">
														+ Add
													</span>
												)}
											</button>
										);
									})}
							</div>

							{/* Footer */}
							<div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
								<button
									onClick={close}
									className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
								>
									Cancel
								</button>
								<button
									onClick={() => setStep(2)}
									disabled={selected.length === 0}
									className="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
								>
									Next ({selected.length} selected)
								</button>
							</div>
						</div>
					)}

					{step === 2 && (
						<div>
							<h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
								Review &amp; Create Plan
							</h2>

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
										<span className="flex-1 font-medium text-gray-700 dark:text-gray-200 text-sm">
											{s.title}
										</span>
										<button
											onClick={() => removeRecipe(s.id)}
											className="text-xs text-red-400 hover:text-red-600"
											aria-label={`Remove ${s.title}`}
										>
											Remove
										</button>
									</li>
								))}
							</ul>

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

							{/* Footer */}
							<div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
								<button
									onClick={() => setStep(1)}
									className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
								>
									&larr; Back
								</button>
								<button
									onClick={handleCreate}
									disabled={submitting || selected.length === 0}
									className="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2 rounded-md text-sm font-medium transition-colors"
								>
									{submitting ? "Creating..." : "Create Plan"}
								</button>
							</div>
						</div>
					)}
				</div>
			</dialog>
		</>
	);
}
