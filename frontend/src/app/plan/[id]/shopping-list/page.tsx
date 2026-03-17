import { getPlan } from "@/lib/api";
import { notFound } from "next/navigation";
import ShoppingList from "./ShoppingList";

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString("en-GB", {
		weekday: "short",
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

export default async function ShoppingListPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	let plan;
	try {
		plan = await getPlan(id);
	} catch {
		notFound();
	}

	return (
		<div className="max-w-2xl mx-auto px-4 py-8">
			<h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">
				Shopping List
			</h1>
			<p className="text-sm text-gray-500 mb-6">
				For plan: {formatDate(plan.startsOn)} &mdash; {plan.items.length} recipe{plan.items.length !== 1 && "s"}
			</p>
			<ShoppingList planId={Number(id)} />
		</div>
	);
}
