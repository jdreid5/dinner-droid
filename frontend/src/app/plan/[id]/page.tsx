import Link from "next/link";
import { cookies } from "next/headers";
import { ApiError, getPlan } from "@/lib/api";
import { notFound, redirect } from "next/navigation";
import { PageContainer, SectionHeading } from "@/app/components/ui";
import PlanDeleteButton from "./PlanDeleteButton";

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString("en-GB", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

export default async function PlanDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const nextPath = `/plan/${id}`;
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
					<PageContainer className="max-w-3xl">
						<h1 className="mb-3 text-3xl text-ink">Plan unavailable</h1>
						<p className="text-muted">
							You do not have permission to view this plan.
						</p>
					</PageContainer>
				);
			}
		}

		const message = error instanceof Error ? error.message : "Failed to load plan.";
		return (
			<PageContainer className="max-w-3xl">
				<h1 className="mb-3 text-3xl text-ink">Could not load plan</h1>
				<p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-400">
					{message}
				</p>
			</PageContainer>
		);
	}

	return (
		<PageContainer className="max-w-3xl">
			<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<SectionHeading>Meal plan</SectionHeading>
					<h1 className="mt-1 text-3xl text-ink">{formatDate(plan.startsOn)}</h1>
					{plan.notes && <p className="mt-2 text-muted">{plan.notes}</p>}
				</div>
				<PlanDeleteButton planId={plan.id} />
			</div>

			<ul className="mb-8 flex flex-col gap-2">
				{plan.items.map((item, i) => (
					<li
						key={item.recipeId}
						className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3"
					>
						<span className="w-5 text-right text-sm tabular-nums text-muted">
							{i + 1}.
						</span>
						{item.imageUrl && (
							<img
								src={item.imageUrl}
								alt={item.title}
								className="h-12 w-12 flex-shrink-0 rounded object-cover"
							/>
						)}
						<Link
							href={`/recipes/${item.recipeId}`}
							className="flex-1 font-medium text-ink transition-colors hover:text-accent"
						>
							{item.title}
						</Link>
						{item.cookMinutes != null && (
							<span className="whitespace-nowrap text-xs tabular-nums text-muted">
								{item.cookMinutes} min
							</span>
						)}
					</li>
				))}
			</ul>

			<Link
				href={`/plan/${plan.id}/shopping-list`}
				className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
			>
				Generate Shopping List
			</Link>
		</PageContainer>
	);
}
