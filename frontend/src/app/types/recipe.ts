export type Ingredient = {
	name: string;
	qty: number | null;
	unit: string | null;
	altText: string | null;
	isPantry: boolean;
}

export type Step = {
	n: number;
	body: string;
}

export type Recipe = {
	id: number;
	title: string;
	sourceUrl?: string | null;
	imageUrl?: string | null;
	tags?: string[];
	servings?: number | null;
	cookMinutes?: number | null;
	calories?: number | null;
	protein?: number | null;
	carbohydrate?: number | null;
	fat?: number | null;
	fibre?: number | null;
	salt?: number | null;
	notes?: string | null;
	steps?: Step[];
	ingredients?: Ingredient[];
}

export type Nutrition = {
	calories?: number | null;
	protein?: number | null;
	carbohydrate?: number | null;
	fat?: number | null;
	fibre?: number | null;
	salt?: number | null;
}

export type PlanItemSummary = {
	recipeId: number;
	title: string;
	imageUrl: string | null;
	cookMinutes: number | null;
	dayIndex: number | null;
};

export type Plan = {
	id: number;
	startsOn: string;
	notes: string | null;
	createdAt: string;
	items: PlanItemSummary[];
};

export type ShoppingListItem = {
	name: string;
	qty: number | null;
	unit: string | null;
	isPantry: boolean;
};

export type User = {
	id: number;
	email: string;
	name: string | null;
};