import Link from "next/link";
import { getPlans } from "@/lib/api";
import type { Plan } from "@/app/types/recipe";

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString("en-GB", {
		weekday: "short",
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

export default async function Home() {
	let plans: Plan[] = [];
	try {
		plans = await getPlans();
	} catch {
		// Backend may be unreachable
	}

	const latestPlan = plans.length > 0 ? plans[0] : null;

	return (
		<div className="max-w-3xl mx-auto px-4 py-12">
			<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
				Welcome to Dinner Droid
			</h1>
			<p className="text-gray-500 mb-10">
				Plan your meals, browse recipes, and generate shopping lists.
			</p>

			{latestPlan ? (
				<div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 mb-8">
					<h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
						Latest Plan
					</h2>
					<p className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
						{formatDate(latestPlan.startsOn)}
					</p>
					<p className="text-sm text-gray-500 mb-4">
						{latestPlan.items.length} recipe{latestPlan.items.length !== 1 && "s"}
						{latestPlan.notes && <> &mdash; {latestPlan.notes}</>}
					</p>
					<ul className="flex flex-col gap-1 mb-5">
						{latestPlan.items.map((item) => (
							<li key={item.recipeId} className="text-sm text-gray-600 dark:text-gray-300">
								{item.title}
							</li>
						))}
					</ul>
					<div className="flex gap-3">
						<Link
							href={`/plan/${latestPlan.id}`}
							className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
						>
							View Plan
						</Link>
						<Link
							href={`/plan/${latestPlan.id}/shopping-list`}
							className="border border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4 py-2 rounded-md text-sm font-medium transition-colors"
						>
							Shopping List
						</Link>
					</div>
				</div>
			) : (
				<div className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-10 text-center mb-8">
					<p className="text-gray-500 mb-4">You don&apos;t have any plans yet.</p>
					<Link
						href="/plan/new"
						className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium transition-colors"
					>
						Create Your First Plan
					</Link>
				</div>
			)}

			<div className="flex gap-4">
				<Link
					href="/plan/new"
					className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-md text-sm font-medium transition-colors"
				>
					New Plan
				</Link>
				<Link
					href="/recipes"
					className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-5 py-2.5 rounded-md text-sm font-medium transition-colors"
				>
					Browse Recipes
				</Link>
			</div>
		</div>
	);
}
