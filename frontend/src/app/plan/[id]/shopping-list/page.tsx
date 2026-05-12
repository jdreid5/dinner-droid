import { cookies } from "next/headers";
import { ApiError, getPlan } from "@/lib/api";
import { notFound, redirect } from "next/navigation";
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
	const nextPath = `/plan/${id}/shopping-list`;
	const cookieStore = await cookies();
	if (!cookieStore.get("dd_session")) {
		redirect(`/login?next=${encodeURIComponent(nextPath)}`);
	}

	let plan;
	try {
		plan = await getPlan(id);
	} catch (error) {
		if (error instanceof ApiError) {
			if (error.status === 401) {
				redirect(`/login?next=${encodeURIComponent(nextPath)}`);
			}
			if (error.status === 404) notFound();
			if (error.status === 403) {
				return (
					<div className="max-w-2xl mx-auto px-4 py-8">
						<h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
							Shopping list unavailable
						</h1>
						<p className="text-gray-500">
							You do not have permission to view this plan&apos;s shopping list.
						</p>
					</div>
				);
			}
		}

		const message = error instanceof Error ? error.message : "Failed to load plan.";
		return (
			<div className="max-w-2xl mx-auto px-4 py-8">
				<h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
					Could not load shopping list
				</h1>
				<p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
					{message}
				</p>
			</div>
		);
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
