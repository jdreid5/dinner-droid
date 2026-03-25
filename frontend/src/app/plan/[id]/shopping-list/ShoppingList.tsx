"use client";

import { useState, useEffect, useCallback } from "react";
import type { ShoppingListItem } from "@/app/types/recipe";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

export default function ShoppingList({ planId }: { planId: number }) {
	const [portions, setPortions] = useState(2);
	const [items, setItems] = useState<ShoppingListItem[]>([]);
	const [checked, setChecked] = useState<Set<string>>(new Set());
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchList = useCallback(async (p: number) => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(
				`${API_BASE}/api/plans/${planId}/shopping-list?portions=${p}`
			);
			if (!res.ok) throw new Error("Failed to fetch shopping list");
			const data = await res.json();
			setItems(data.items);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong");
		} finally {
			setLoading(false);
		}
	}, [planId]);

	useEffect(() => {
		fetchList(portions);
	}, [portions, fetchList]);

	const toggleItem = (key: string) => {
		setChecked((prev) => {
			const next = new Set(prev);
			if (next.has(key)) {
				next.delete(key);
			} else {
				next.add(key);
			}
			return next;
		});
	};

	const shoppingItems = items.filter((i) => !i.isPantry);
	const pantryItems = items.filter((i) => i.isPantry);

	const formatQty = (item: ShoppingListItem) => {
		const unit = item.unit ? ` ${item.unit}` : "";
		if (item.isPantry) {
			return `${item.name}`;
		}
		return `${item.qty}${unit} ${item.name}`;
	};

	const itemKey = (item: ShoppingListItem) =>
		`${item.name}|${item.unit ?? ""}`;

	const renderSection = (title: string, sectionItems: ShoppingListItem[]) => {
		if (sectionItems.length === 0) return null;
		return (
			<div className="mb-6">
				<h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
					{title}
				</h2>
				<ul className="flex flex-col gap-1">
					{sectionItems.map((item) => {
						const key = itemKey(item);
						const isChecked = checked.has(key);
						return (
							<li key={key}>
								<label
									className={`flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
										isChecked ? "opacity-50" : ""
									}`}
								>
									<input
										type="checkbox"
										checked={isChecked}
										onChange={() => toggleItem(key)}
										className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
									/>
									<span
										className={`text-sm text-gray-700 dark:text-gray-200 ${
											isChecked ? "line-through" : ""
										}`}
									>
										{formatQty(item)}
									</span>
								</label>
							</li>
						);
					})}
				</ul>
			</div>
		);
	};

	return (
		<div>
			<div className="flex items-center gap-3 mb-6">
				<label htmlFor="portions" className="text-sm font-medium text-gray-600 dark:text-gray-300">
					Portions:
				</label>
				<input
					id="portions"
					type="number"
					min={1}
					max={10}
					value={portions}
					onChange={(e) => {
						const val = Number(e.target.value);
						if (val >= 1 && val <= 10) setPortions(val);
					}}
					className="w-16 p-1.5 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 text-sm text-center"
				/>
			</div>

			{loading && (
				<p className="text-sm text-gray-400 py-4">Loading...</p>
			)}

			{error && (
				<p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/30 rounded-md px-3 py-2 mb-4">
					{error}
				</p>
			)}

			{!loading && !error && items.length === 0 && (
				<p className="text-sm text-gray-400 py-4">No ingredients found for this plan.</p>
			)}

			{!loading && !error && items.length > 0 && (
				<>
					{renderSection("", shoppingItems)}
					{renderSection("Pantry Ingredients", pantryItems)}
				</>
			)}
		</div>
	);
}
