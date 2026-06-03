"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePlan } from "@/lib/api";
import { Button } from "@/app/components/ui";

export default function PlanDeleteButton({ planId }: { planId: number }) {
	const router = useRouter();
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleDelete = async () => {
		setDeleting(true);
		setError(null);
		try {
			await deletePlan(planId);
			router.push("/plan");
			router.refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to delete plan");
			setDeleting(false);
		}
	};

	return (
		<div>
			<Button
				variant="danger"
				size="sm"
				onClick={handleDelete}
				disabled={deleting}
			>
				{deleting ? "Deleting..." : "Delete Plan"}
			</Button>
			{error && (
				<p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
			)}
		</div>
	);
}
