import { cookies } from "next/headers";
import { ApiError, getPlan } from "@/lib/api";
import { notFound, redirect } from "next/navigation";
import { PageContainer } from "@/app/components/ui";
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
					<PageContainer className="max-w-2xl">
						<h1 className="mb-3 text-3xl text-ink">Shopping list unavailable</h1>
						<p className="text-muted">
							You do not have permission to view this plan&apos;s shopping list.
						</p>
					</PageContainer>
				);
			}
		}

		const message = error instanceof Error ? error.message : "Failed to load plan.";
		return (
			<PageContainer className="max-w-2xl">
				<h1 className="mb-3 text-3xl text-ink">Could not load shopping list</h1>
				<p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-400">
					{message}
				</p>
			</PageContainer>
		);
	}

	return (
		<PageContainer className="max-w-2xl">
			<h1 className="text-3xl text-ink">Shopping List</h1>
			<p className="mb-6 mt-2 text-sm text-muted">
				For plan: {formatDate(plan.startsOn)} &mdash; {plan.items.length} recipe{plan.items.length !== 1 && "s"}
			</p>
			<ShoppingList planId={Number(id)} />
		</PageContainer>
	);
}
