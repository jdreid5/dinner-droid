import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError, getPlans } from "@/lib/api";
import PlanList from "./PlanList";

export default async function PlanPage() {
	const cookieStore = await cookies();
	if (!cookieStore.get("dd_session")) {
		redirect(`/login?next=${encodeURIComponent("/plan")}`);
	}

	let plans = [] as Awaited<ReturnType<typeof getPlans>>;
	let loadError: string | null = null;
	try {
		plans = await getPlans();
	} catch (error) {
		if (error instanceof ApiError && error.status === 401) {
			redirect(`/login?next=${encodeURIComponent("/plan")}`);
		}
		loadError = error instanceof Error ? error.message : "Failed to load plans.";
	}

	return (
		<div className="max-w-3xl mx-auto px-4 py-8">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
					Meal Plans
				</h1>
				<Link
					href="/plan/new"
					className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-md font-medium transition-colors"
				>
					Make a New Plan
				</Link>
			</div>
			{loadError ? (
				<p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
					{loadError}
				</p>
			) : (
				<PlanList plans={plans} />
			)}
		</div>
	);
}
