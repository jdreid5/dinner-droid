const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

import type { Recipe, Plan, ShoppingListItem } from "@/app/types/recipe";

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

export async function getPlans(): Promise<Plan[]> {
	const res = await fetch(`${API_BASE}/api/plans`, { cache: "no-store" });
	if (!res.ok) {
		throw new Error(`Failed to fetch plans: ${res.statusText}`);
	}
	return res.json();
}

export async function getPlan(id: string | number): Promise<Plan> {
	const res = await fetch(`${API_BASE}/api/plans/${id}`, { cache: "no-store" });
	if (!res.ok) {
		throw new Error(`Failed to fetch plan: ${res.statusText}`);
	}
	return res.json();
}

export async function createPlan(recipeIds: number[], notes?: string): Promise<Plan> {
	const res = await fetch(`${API_BASE}/api/plans`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ recipeIds, notes }),
	});
	if (!res.ok) {
		throw new Error(`Failed to create plan: ${res.statusText}`);
	}
	return res.json();
}

export async function getShoppingList(planId: string | number, portions: number = 2): Promise<{ items: ShoppingListItem[] }> {
	const res = await fetch(`${API_BASE}/api/plans/${planId}/shopping-list?portions=${portions}`, { cache: "no-store" });
	if (!res.ok) {
		throw new Error(`Failed to fetch shopping list: ${res.statusText}`);
	}
	return res.json();
}

export async function deletePlan(id: string | number): Promise<{ ok: boolean; id: number }> {
	const res = await fetch(`${API_BASE}/api/plans/${id}`, {
		method: "DELETE"
	});
	if (!res.ok) {
		const responseText = await res.text();
		const detail = responseText ? ` - ${responseText}` : "";
		throw new Error(`Failed to delete plan (${res.status} ${res.statusText})${detail}`);
	}
	return res.json();
}