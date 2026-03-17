import Link from "next/link";
import { getPlan } from "@/lib/api";
import { notFound } from "next/navigation";
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
	let plan;
	try {
		plan = await getPlan(id);
	} catch {
		notFound();
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
