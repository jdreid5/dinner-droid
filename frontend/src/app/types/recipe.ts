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