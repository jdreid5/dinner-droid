import type { Recipe, Plan, ShoppingListItem, User } from "@/app/types/recipe";

export class ApiError extends Error {
	constructor(
		message: string,
		public readonly status: number,
		public readonly statusText: string,
		public readonly body: string,
	) {
		super(message);
		this.name = "ApiError";
	}
}

function getApiBase(): string {
	if (typeof window !== "undefined") return "";
	return process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
}

async function authHeaders(): Promise<HeadersInit> {
	if (typeof window !== "undefined") return {};
	const { cookies } = await import("next/headers");
	const cookieStore = await cookies();
	const session = cookieStore.get("dd_session");
	return session ? { Cookie: `dd_session=${session.value}` } : {};
}

async function apiError(res: Response, fallback: string): Promise<ApiError> {
	const body = await res.text();
	let detail = body;
	try {
		const json = JSON.parse(body);
		detail = typeof json.error === "string" ? json.error : body;
	} catch {
		// Keep the response text when the backend does not send JSON.
	}

	const message = detail
		? `${fallback} (${res.status} ${res.statusText}): ${detail}`
		: `${fallback} (${res.status} ${res.statusText})`;
	return new ApiError(message, res.status, res.statusText, body);
}

export async function getRecipes(): Promise<Recipe[]> {
	const res = await fetch(`${getApiBase()}/api/recipes`, {
		cache: "no-store",
		headers: { ...(await authHeaders()) },
	});
	if (!res.ok) {
		throw new Error(`Failed to fetch recipes: ${res.statusText}`);
	}
	return res.json();
}

export async function getRecipe(id: string | number): Promise<Recipe> {
	const res = await fetch(`${getApiBase()}/api/recipes/${id}`, {
		cache: "no-store",
		headers: { ...(await authHeaders()) },
	});
	if (!res.ok) {
		throw new Error(`Failed to fetch recipe: ${res.statusText}`);
	}
	return res.json();
}

export async function getSearchedRecipes(query: string): Promise<Recipe[]> {
	const res = await fetch(`${getApiBase()}/api/searched-recipes?searchTerm=${query}`, {
		cache: "no-store",
		headers: { ...(await authHeaders()) },
	});
	if (!res.ok) {
		throw new Error(`Failed to fetch searched recipes: ${res.statusText}`);
	}
	return res.json();
}

export async function getPlans(): Promise<Plan[]> {
	const res = await fetch(`${getApiBase()}/api/plans`, {
		cache: "no-store",
		headers: { ...(await authHeaders()) },
	});
	if (!res.ok) {
		throw await apiError(res, "Failed to fetch plans");
	}
	return res.json();
}

export async function getPlan(id: string | number): Promise<Plan> {
	const res = await fetch(`${getApiBase()}/api/plans/${id}`, {
		cache: "no-store",
		headers: { ...(await authHeaders()) },
	});
	if (!res.ok) {
		throw await apiError(res, "Failed to fetch plan");
	}
	return res.json();
}

export async function createPlan(recipeIds: number[], notes?: string): Promise<Plan> {
	const res = await fetch(`${getApiBase()}/api/plans`, {
		method: "POST",
		headers: { "Content-Type": "application/json", ...(await authHeaders()) },
		body: JSON.stringify({ recipeIds, notes }),
		credentials: "same-origin",
	});
	if (!res.ok) {
		throw await apiError(res, "Failed to create plan");
	}
	return res.json();
}

export async function getShoppingList(planId: string | number, portions: number = 2): Promise<{ items: ShoppingListItem[] }> {
	const res = await fetch(`${getApiBase()}/api/plans/${planId}/shopping-list?portions=${portions}`, {
		cache: "no-store",
		headers: { ...(await authHeaders()) },
		credentials: "same-origin",
	});
	if (!res.ok) {
		throw await apiError(res, "Failed to fetch shopping list");
	}
	return res.json();
}

export async function deletePlan(id: string | number): Promise<{ ok: boolean; id: number }> {
	const res = await fetch(`${getApiBase()}/api/plans/${id}`, {
		method: "DELETE",
		headers: { ...(await authHeaders()) },
		credentials: "same-origin",
	});
	if (!res.ok) {
		throw await apiError(res, "Failed to delete plan");
	}
	return res.json();
}

// ----- Auth -----

export async function signup(
	email: string,
	password: string,
	name?: string,
): Promise<{ user: User }> {
	const res = await fetch("/api/auth/signup", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password, name }),
	});
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(body.error ?? `Signup failed (${res.status})`);
	}
	return res.json();
}

export async function login(
	email: string,
	password: string,
): Promise<{ user: User }> {
	const res = await fetch("/api/auth/login", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password }),
	});
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(body.error ?? `Login failed (${res.status})`);
	}
	return res.json();
}

export async function logout(): Promise<{ ok: boolean }> {
	const res = await fetch("/api/auth/logout", { method: "POST" });
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(body.error ?? `Logout failed (${res.status})`);
	}
	return res.json();
}

export async function getMe(): Promise<{ user: User }> {
	const res = await fetch("/api/auth/me", { cache: "no-store" });
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(body.error ?? `Not authenticated (${res.status})`);
	}
	return res.json();
}