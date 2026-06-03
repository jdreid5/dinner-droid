import Link from "next/link";
import { cookies } from "next/headers";
import { getPlans } from "@/lib/api";
import type { Plan } from "@/app/types/recipe";
import { Card, PageContainer, SectionHeading } from "@/app/components/ui";

// Link-styled CTAs that mirror the <Button> variants (links can't be buttons).
const ctaBase =
	"inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const ctaPrimary = `${ctaBase} bg-accent text-white hover:bg-accent-hover`;
const ctaOutline = `${ctaBase} border border-border bg-transparent text-ink hover:bg-surface`;

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString("en-GB", {
		weekday: "short",
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

export default async function Home() {
	const cookieStore = await cookies();
	const isLoggedIn = !!cookieStore.get("dd_session");

	let plans: Plan[] = [];
	if (isLoggedIn) {
		try {
			plans = await getPlans();
		} catch {
			// Backend may be unreachable or session expired
		}
	}

	const latestPlan = plans.length > 0 ? plans[0] : null;

	return (
		<PageContainer className="max-w-3xl">
			<header className="mb-10 sm:mb-12">
				<SectionHeading className="mb-3 text-accent">
					Dinner Droid
				</SectionHeading>
				<h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
					Cook with a little more intention.
				</h1>
				<p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
					Plan your week, browse recipes worth making again, and turn any plan
					into a tidy shopping list.
				</p>
			</header>

			{latestPlan ? (
				<Card className="mb-8">
					<SectionHeading className="mb-3">Latest Plan</SectionHeading>
					<p className="font-serif text-2xl font-semibold text-ink">
						{formatDate(latestPlan.startsOn)}
					</p>
					<p className="mt-1 text-sm text-muted">
						{latestPlan.items.length} recipe
						{latestPlan.items.length !== 1 && "s"}
						{latestPlan.notes && <> &mdash; {latestPlan.notes}</>}
					</p>
					<ul className="mt-4 mb-6 flex flex-col divide-y divide-border">
						{latestPlan.items.map((item) => (
							<li
								key={item.recipeId}
								className="py-2 text-sm text-ink first:pt-0 last:pb-0"
							>
								{item.title}
							</li>
						))}
					</ul>
					<div className="flex flex-wrap gap-3">
						<Link href={`/plan/${latestPlan.id}`} className={`${ctaPrimary} px-4 py-2`}>
							View Plan
						</Link>
						<Link
							href={`/plan/${latestPlan.id}/shopping-list`}
							className={`${ctaOutline} px-4 py-2`}
						>
							Shopping List
						</Link>
					</div>
				</Card>
			) : (
				<Card className="mb-8 border-dashed text-center">
					<p className="mb-5 text-muted">
						{isLoggedIn
							? "You don't have any plans yet — let's fix that."
							: "Log in to see your meal plans and pick up where you left off."}
					</p>
					<Link
						href={isLoggedIn ? "/plan/new" : "/login"}
						className={`${ctaPrimary} px-6 py-3`}
					>
						{isLoggedIn ? "Create Your First Plan" : "Log In"}
					</Link>
				</Card>
			)}

			<div className="flex flex-wrap gap-3">
				{isLoggedIn && (
					<Link href="/plan/new" className={`${ctaPrimary} px-5 py-2.5`}>
						New Plan
					</Link>
				)}
				<Link href="/recipes" className={`${ctaOutline} px-5 py-2.5`}>
					Browse Recipes
				</Link>
			</div>
		</PageContainer>
	);
}
