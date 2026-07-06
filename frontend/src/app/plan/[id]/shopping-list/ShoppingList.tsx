"use client";

import { useState, useEffect, useCallback } from "react";
import type { ShoppingListItem } from "@/app/types/recipe";
import { getShoppingList } from "@/lib/api";
import { Button, Input, SectionHeading } from "@/app/components/ui";

const CSV_HEADERS = ["Name", "Quantity", "Unit"];
const MIN_PORTIONS = 1;
const MAX_PORTIONS = 10;

const itemKey = (item: ShoppingListItem) =>
	`${item.name}|${item.unit ?? ""}`;

function escapeCsvValue(value: string | number | null | undefined) {
	const stringValue = value == null ? "" : String(value);
	const safeValue = /^[=+\-@]/.test(stringValue)
		? `'${stringValue}`
		: stringValue;
	const escapedValue = safeValue.replaceAll('"', '""');

	if (/[",\r\n]/.test(escapedValue)) {
		return `"${escapedValue}"`;
	}

	return escapedValue;
}

function buildShoppingListCsv(
	shoppingItems: ShoppingListItem[],
	pantryItems: ShoppingListItem[],
) {
	const rows = [
		CSV_HEADERS,
		...shoppingItems.map((item) => [
			item.name,
			item.qty,
			item.unit,
		]),
		...pantryItems.map((item) => [
			item.name,
			item.qty,
			item.unit,
		]),
	];

	return `\uFEFF${rows
		.map((row) => row.map(escapeCsvValue).join(","))
		.join("\r\n")}\r\n`;
}

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
			const data = await getShoppingList(planId, p);
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
	const canExportCsv = !loading && !error && items.length > 0;

	const updatePortions = (nextPortions: number) => {
		if (!Number.isInteger(nextPortions)) return;
		setPortions(Math.min(MAX_PORTIONS, Math.max(MIN_PORTIONS, nextPortions)));
	};

	const decrementPortions = () => updatePortions(portions - 1);
	const incrementPortions = () => updatePortions(portions + 1);

	const formatQty = (item: ShoppingListItem) => {
		const unit = item.unit ? ` ${item.unit}` : "";
		if (item.isPantry) {
			return `${item.name}`;
		}
		return `${item.qty}${unit} ${item.name}`;
	};

	const handleExportCsv = () => {
		const csv = buildShoppingListCsv(shoppingItems, pantryItems);
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");

		link.href = url;
		link.download = `shopping-list-plan-${planId}-${portions}-portions.csv`;
		document.body.appendChild(link);
		link.click();
		link.remove();
		URL.revokeObjectURL(url);
	};

	const renderSection = (title: string, sectionItems: ShoppingListItem[]) => {
		if (sectionItems.length === 0) return null;
		return (
			<div className="mb-6">
				{title && <SectionHeading as="h2" className="mb-3">{title}</SectionHeading>}
				<ul className="flex flex-col gap-1">
					{sectionItems.map((item) => {
						const key = itemKey(item);
						const isChecked = checked.has(key);
						return (
							<li key={key}>
								<label
									className={`flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-surface ${
										isChecked ? "opacity-50" : ""
									}`}
								>
									<input
										type="checkbox"
										checked={isChecked}
										onChange={() => toggleItem(key)}
										className="h-4 w-4 rounded border-border accent-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
									/>
									<span
										className={`text-sm text-ink ${
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
			<div className="mb-6 flex flex-wrap items-center gap-3">
				<div className="flex flex-wrap items-center gap-3">
					<div className="flex items-center gap-2">
						<label htmlFor="portions" className="text-sm font-medium text-ink">
							Portions
						</label>
						<div className="inline-flex overflow-hidden rounded-md border border-border bg-surface">
							<button
								type="button"
								onClick={decrementPortions}
								disabled={portions <= MIN_PORTIONS}
								aria-label="Decrease portions"
								className="flex h-11 w-11 items-center justify-center text-lg font-medium text-ink transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40"
							>
								-
							</button>
							<Input
								id="portions"
								type="text"
								inputMode="numeric"
								pattern="[0-9]*"
								value={portions}
								aria-label="Portion count"
								onChange={(e) => {
									const val = Number(e.target.value.trim());
									updatePortions(val);
								}}
								className="h-11 w-14 rounded-none border-y-0 border-x border-border px-2 text-center tabular-nums focus-visible:ring-inset"
							/>
							<button
								type="button"
								onClick={incrementPortions}
								disabled={portions >= MAX_PORTIONS}
								aria-label="Increase portions"
								className="flex h-11 w-11 items-center justify-center text-lg font-medium text-ink transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40"
							>
								+
							</button>
						</div>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={handleExportCsv}
						disabled={!canExportCsv}
					>
						Export CSV
					</Button>
				</div>
			</div>

			{loading && (
				<p className="py-4 text-sm text-muted">Loading...</p>
			)}

			{error && (
				<p className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-400">
					{error}
				</p>
			)}

			{!loading && !error && items.length === 0 && (
				<p className="py-4 text-sm text-muted">No ingredients found for this plan.</p>
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
