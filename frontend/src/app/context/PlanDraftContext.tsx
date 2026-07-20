"use client";

import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import type { Recipe } from "@/app/types/recipe";

export type PlanDraftRecipe = Pick<
	Recipe,
	"id" | "title" | "imageUrl" | "cookMinutes"
>;

type PlanDraft = {
	recipes: PlanDraftRecipe[];
	notes: string;
	updatedAt: string;
};

type PlanDraftContextValue = {
	recipes: PlanDraftRecipe[];
	notes: string;
	count: number;
	addRecipe: (recipe: PlanDraftRecipe) => void;
	removeRecipe: (id: number) => void;
	setNotes: (notes: string) => void;
	mergeRecipes: (recipes: PlanDraftRecipe[]) => void;
	clearDraft: () => void;
};

const STORAGE_KEY = "dd_plan_draft";

const PlanDraftContext = createContext<PlanDraftContextValue | null>(null);

const EMPTY_DRAFT: PlanDraft = {
	recipes: [],
	notes: "",
	updatedAt: "",
};

function isPlanDraftRecipe(value: unknown): value is PlanDraftRecipe {
	if (!value || typeof value !== "object") return false;
	const r = value as Record<string, unknown>;
	return typeof r.id === "number" && typeof r.title === "string";
}

function readStoredDraft(): PlanDraft {
	if (typeof window === "undefined") return EMPTY_DRAFT;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return EMPTY_DRAFT;
		const parsed = JSON.parse(raw) as unknown;
		if (!parsed || typeof parsed !== "object") return EMPTY_DRAFT;
		const draft = parsed as Record<string, unknown>;
		const recipes = Array.isArray(draft.recipes)
			? draft.recipes.filter(isPlanDraftRecipe).map((r) => ({
					id: r.id,
					title: r.title,
					imageUrl: (r.imageUrl as string | null | undefined) ?? null,
					cookMinutes: (r.cookMinutes as number | null | undefined) ?? null,
				}))
			: [];
		const notes = typeof draft.notes === "string" ? draft.notes : "";
		const updatedAt =
			typeof draft.updatedAt === "string" ? draft.updatedAt : "";
		return { recipes, notes, updatedAt };
	} catch {
		return EMPTY_DRAFT;
	}
}

function persistDraft(draft: PlanDraft) {
	if (typeof window === "undefined") return;
	if (draft.recipes.length === 0 && !draft.notes.trim()) {
		window.localStorage.removeItem(STORAGE_KEY);
		return;
	}
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

function normalizeRecipe(recipe: PlanDraftRecipe): PlanDraftRecipe {
	return {
		id: recipe.id,
		title: recipe.title,
		imageUrl: recipe.imageUrl ?? null,
		cookMinutes: recipe.cookMinutes ?? null,
	};
}

function withTimestamp(
	recipes: PlanDraftRecipe[],
	notes: string,
): PlanDraft {
	return {
		recipes,
		notes,
		updatedAt: new Date().toISOString(),
	};
}

export function PlanDraftProvider({ children }: { children: React.ReactNode }) {
	const [draft, setDraft] = useState<PlanDraft>(readStoredDraft);

	const addRecipe = useCallback((recipe: PlanDraftRecipe) => {
		const normalized = normalizeRecipe(recipe);
		setDraft((prev) => {
			if (prev.recipes.some((r) => r.id === normalized.id)) return prev;
			const next = withTimestamp([...prev.recipes, normalized], prev.notes);
			persistDraft(next);
			return next;
		});
	}, []);

	const removeRecipe = useCallback((id: number) => {
		setDraft((prev) => {
			const next = withTimestamp(
				prev.recipes.filter((r) => r.id !== id),
				prev.notes,
			);
			persistDraft(next);
			return next;
		});
	}, []);

	const setNotes = useCallback((notes: string) => {
		setDraft((prev) => {
			const next = withTimestamp(prev.recipes, notes);
			persistDraft(next);
			return next;
		});
	}, []);

	const mergeRecipes = useCallback((incoming: PlanDraftRecipe[]) => {
		if (incoming.length === 0) return;
		setDraft((prev) => {
			const existing = new Set(prev.recipes.map((r) => r.id));
			const toAdd = incoming
				.map(normalizeRecipe)
				.filter((r) => !existing.has(r.id));
			if (toAdd.length === 0) return prev;
			const next = withTimestamp(
				[...prev.recipes, ...toAdd],
				prev.notes,
			);
			persistDraft(next);
			return next;
		});
	}, []);

	const clearDraft = useCallback(() => {
		setDraft(EMPTY_DRAFT);
		if (typeof window !== "undefined") {
			window.localStorage.removeItem(STORAGE_KEY);
		}
	}, []);

	const value = useMemo<PlanDraftContextValue>(
		() => ({
			recipes: draft.recipes,
			notes: draft.notes,
			count: draft.recipes.length,
			addRecipe,
			removeRecipe,
			setNotes,
			mergeRecipes,
			clearDraft,
		}),
		[
			draft.recipes,
			draft.notes,
			addRecipe,
			removeRecipe,
			setNotes,
			mergeRecipes,
			clearDraft,
		],
	);

	return (
		<PlanDraftContext value={value}>{children}</PlanDraftContext>
	);
}

export function usePlanDraft(): PlanDraftContextValue {
	const ctx = useContext(PlanDraftContext);
	if (!ctx) {
		throw new Error("usePlanDraft must be used within a PlanDraftProvider");
	}
	return ctx;
}
