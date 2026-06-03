"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";
import type { Plan } from "@/app/types/recipe";
import { deletePlan } from "@/lib/api";
import { Button } from "@/app/components/ui";

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString("en-GB", {
		weekday: "short",
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

export default function PlanList({ plans }: { plans: Plan[] }) {
	const router = useRouter();
	const [deletingPlanId, setDeletingPlanId] = useState<number | null>(null);
	const [deleteError, setDeleteError] = useState<string | null>(null);

	const handleDelete = async (
		event: MouseEvent<HTMLButtonElement>,
		planId: number
	) => {
		event.preventDefault();
		event.stopPropagation();
		setDeleteError(null);
		setDeletingPlanId(planId);

		try {
			await deletePlan(planId);
			router.refresh();
		} catch (error) {
			setDeleteError(
				error instanceof Error ? error.message : "Failed to delete plan"
			);
		} finally {
			setDeletingPlanId(null);
		}
	};

	if (plans.length === 0) {
		return (
			<p className="py-8 text-center text-muted">
				No plans yet. Create your first one!
			</p>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			{deleteError && (
				<p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-400">
					{deleteError}
				</p>
			)}
			{plans.map((plan) => (
				<details
					key={plan.id}
					className="group overflow-hidden rounded-xl border border-border bg-surface"
				>
					<summary className="flex cursor-pointer list-none select-none flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
						<Link
							href={`/plan/${plan.id}`}
							className="font-medium text-ink transition-colors hover:text-accent"
							onClick={(e) => e.stopPropagation()}
						>
							{formatDate(plan.startsOn)}
						</Link>
						<div className="flex flex-wrap items-center gap-3">
							<Link
								href={`/plan/${plan.id}/shopping-list`}
								className="text-xs font-medium text-accent transition-colors hover:text-accent-hover"
								onClick={(e) => e.stopPropagation()}
							>
								Shopping List
							</Link>
							<Button
								variant="danger"
								size="sm"
								onClick={(event) => handleDelete(event, plan.id)}
								disabled={deletingPlanId === plan.id}
							>
								{deletingPlanId === plan.id ? "Deleting..." : "Delete"}
							</Button>
							<span className="text-sm tabular-nums text-muted">
								{plan.items.length} recipe{plan.items.length !== 1 && "s"}
							</span>
							<span
								className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-transparent text-accent transition-transform group-open:rotate-90"
								aria-hidden="true"
							>
								<svg
									viewBox="0 0 20 20"
									fill="none"
									className="h-4 w-4"
								>
									<path
										d="M7.5 5L12.5 10L7.5 15"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</span>
						</div>
					</summary>

					<div className="border-t border-border px-4 py-3">
						{plan.notes && (
							<p className="mb-3 text-sm italic text-muted">{plan.notes}</p>
						)}
						<ul className="flex flex-col gap-2">
							{plan.items.map((item) => (
								<li
									key={item.recipeId}
									className="flex items-center gap-3 rounded-md bg-background px-3 py-2"
								>
									{item.imageUrl && (
										<img
											src={item.imageUrl}
											alt={item.title}
											className="h-10 w-10 flex-shrink-0 rounded object-cover"
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
					</div>
				</details>
			))}
		</div>
	);
}
