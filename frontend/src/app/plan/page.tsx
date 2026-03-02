import { getPlans } from "@/lib/api";
import PlanList from "./PlanList";
import PlanWizardModal from "./PlanWizardModal";

export default async function PlanPage() {
	let plans = [] as Awaited<ReturnType<typeof getPlans>>;
	try {
		plans = await getPlans();
	} catch {
		// Backend may be unreachable or have no data yet -- show empty state
	}

	return (
		<div className="max-w-3xl mx-auto px-4 py-8">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
					Meal Plans
				</h1>
				<PlanWizardModal />
			</div>
			<PlanList plans={plans} />
		</div>
	);
}
