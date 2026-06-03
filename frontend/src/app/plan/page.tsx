import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError, getPlans } from "@/lib/api";
import { PageContainer, SectionHeading } from "@/app/components/ui";
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
		<PageContainer className="max-w-3xl">
			<div className="mb-8 flex flex-wrap items-center justify-between gap-4">
				<div>
					<SectionHeading>Your kitchen</SectionHeading>
					<h1 className="mt-1 text-3xl text-ink">Meal Plans</h1>
				</div>
				<Link
					href="/plan/new"
					className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
				>
					Make a New Plan
				</Link>
			</div>
			{loadError ? (
				<p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-400">
					{loadError}
				</p>
			) : (
				<PlanList plans={plans} />
			)}
		</PageContainer>
	);
}
