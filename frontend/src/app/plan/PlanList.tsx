"use client";

import type { Plan } from "@/app/types/recipe";

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString("en-GB", {
		weekday: "short",
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

export default function PlanList({ plans }: { plans: Plan[] }) {
	if (plans.length === 0) {
		return (
			<p className="text-gray-500 text-center py-8">
				No plans yet. Create your first one!
			</p>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			{plans.map((plan) => (
				<details
					key={plan.id}
					className="group rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
				>
					<summary className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3 select-none list-none">
						<div className="flex items-center gap-3">
							<span className="text-sm font-medium text-gray-400">
								#{plan.id}
							</span>
							<span className="font-semibold text-gray-800 dark:text-gray-100">
								{formatDate(plan.startsOn)}
							</span>
						</div>
						<div className="flex items-center gap-3">
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
									<span className="font-medium text-gray-700 dark:text-gray-200 flex-1">
										{item.title}
									</span>
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
