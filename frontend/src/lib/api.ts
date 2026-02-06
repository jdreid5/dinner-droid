const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

import type { Recipe } from "@/app/types/recipe";

export async function getRecipes(): Promise<Recipe[]> {
	const res = await fetch(`${API_BASE}/api/recipes`, { cache: "no-store" });
	if (!res.ok) {
		throw new Error(`Failed to fetch recipes: ${res.statusText}`);
	}
	return res.json();
}

export async function getRecipe(id: string | number): Promise<Recipe> {
	const res = await fetch(`${API_BASE}/api/recipes/${id}`, { cache: "no-store" });
	if (!res.ok) {
		throw new Error(`Failed to fetch recipe: ${res.statusText}`);
	}
	return res.json();
}

export async function getSearchedRecipes(query: string): Promise<Recipe[]> {
	const res = await fetch(`${API_BASE}/api/searched-recipes?searchTerm=${query}`, { cache: "no-store" });
	if (!res.ok) {
		throw new Error(`Failed to fetch searched recipes: ${res.statusText}`);
	}
	return res.json();
}