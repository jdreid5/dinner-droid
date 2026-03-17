"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePlan } from "@/lib/api";

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
			<button
				onClick={handleDelete}
				disabled={deleting}
				className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{deleting ? "Deleting..." : "Delete Plan"}
			</button>
			{error && (
				<p className="text-sm text-red-500 mt-1">{error}</p>
			)}
		</div>
	);
}
