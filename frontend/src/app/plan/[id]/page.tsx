import Link from "next/link";
import { cookies } from "next/headers";
import { ApiError, getPlan } from "@/lib/api";
import { notFound, redirect } from "next/navigation";
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
					<div className="max-w-3xl mx-auto px-4 py-8">
						<h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
							Plan unavailable
						</h1>
						<p className="text-gray-500">
							You do not have permission to view this plan.
						</p>
					</div>
				);
			}
		}

		const message = error instanceof Error ? error.message : "Failed to load plan.";
		return (
			<div className="max-w-3xl mx-auto px-4 py-8">
				<h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
					Could not load plan
				</h1>
				<p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
					{message}
				</p>
			</div>
		);
	}

	return (
		<div className="max-w-3xl mx-auto px-4 py-8">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
						{formatDate(plan.startsOn)}
					</h1>
					{plan.notes && (
						<p className="text-gray-500 mt-1">{plan.notes}</p>
					)}
				</div>
				<PlanDeleteButton planId={plan.id} />
			</div>

			<ul className="flex flex-col gap-2 mb-8">
				{plan.items.map((item, i) => (
					<li
						key={item.recipeId}
						className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3"
					>
						<span className="text-sm text-gray-400 w-5 text-right">
							{i + 1}.
						</span>
						{item.imageUrl && (
							<img
								src={item.imageUrl}
								alt={item.title}
								className="h-12 w-12 rounded object-cover flex-shrink-0"
							/>
						)}
						<Link
							href={`/recipes/${item.recipeId}`}
							className="flex-1 font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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

			<Link
				href={`/plan/${plan.id}/shopping-list`}
				className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium transition-colors"
			>
				Generate Shopping List
			</Link>
		</div>
	);
}
