"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";
import type { Plan } from "@/app/types/recipe";
import { deletePlan } from "@/lib/api";

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
			<p className="text-gray-500 text-center py-8">
				No plans yet. Create your first one!
			</p>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			{deleteError && (
				<p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
					{deleteError}
				</p>
			)}
			{plans.map((plan) => (
				<details
					key={plan.id}
					className="group rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
				>
					<summary className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3 select-none list-none">
						<div className="flex items-center gap-3">
							<Link
								href={`/plan/${plan.id}`}
								className="font-semibold text-gray-800 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
								onClick={(e) => e.stopPropagation()}
							>
								{formatDate(plan.startsOn)}
							</Link>
						</div>
						<div className="flex items-center gap-3">
							<Link
								href={`/plan/${plan.id}/shopping-list`}
								className="text-xs text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
								onClick={(e) => e.stopPropagation()}
							>
								Shopping List
							</Link>
							<button
								type="button"
								onClick={(event) => handleDelete(event, plan.id)}
								disabled={deletingPlanId === plan.id}
								className="rounded border border-red-300 px-2 py-1 text-sm text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{deletingPlanId === plan.id ? "Deleting..." : "Delete"}
							</button>
							<span className="text-sm text-gray-500">
								{plan.items.length} recipe{plan.items.length !== 1 && "s"}
							</span>
							<span className="text-gray-400 transition-transform group-open:rotate-90">
								&#9654;
							</span>
						</div>
					</summary>

					<div className="border-t border-gray-100 dark:border-gray-700 px-4 py-3">
						{plan.notes && (
							<p className="text-sm text-gray-500 italic mb-3">{plan.notes}</p>
						)}
						<ul className="flex flex-col gap-2">
							{plan.items.map((item) => (
								<li
									key={item.recipeId}
									className="flex items-center gap-3 rounded-md bg-gray-50 dark:bg-gray-800 px-3 py-2"
								>
									{item.imageUrl && (
										<img
											src={item.imageUrl}
											alt={item.title}
											className="h-10 w-10 rounded object-cover flex-shrink-0"
										/>
									)}
									<Link
										href={`/recipes/${item.recipeId}`}
										className="font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 flex-1 transition-colors"
									>
										{item.title}
									</Link>
									{item.cookMinutes != null && (
										<span className="text-xs text-gray-400 whitespace-nowrap">
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
