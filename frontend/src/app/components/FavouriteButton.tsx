"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
	addFavourite,
	getUserFacingErrorMessage,
	isFavourited,
	removeFavourite,
} from "@/lib/api";
import { Button, cn } from "@/app/components/ui";

function HeartIcon({ filled }: { filled: boolean }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill={filled ? "currentColor" : "none"}
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="h-4 w-4"
			aria-hidden="true"
		>
			<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
		</svg>
	);
}

type FavouriteButtonProps = {
	recipeId: number;
	size?: "sm" | "md";
	className?: string;
};

export default function FavouriteButton({
	recipeId,
	size = "md",
	className,
}: FavouriteButtonProps) {
	const { user, loading: authLoading } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const [favourited, setFavourited] = useState(false);
	const [statusLoading, setStatusLoading] = useState(false);
	const [toggling, setToggling] = useState(false);
	const [warning, setWarning] = useState<string | null>(null);

	useEffect(() => {
		if (!warning) return;
		const timer = window.setTimeout(() => setWarning(null), 6000);
		return () => window.clearTimeout(timer);
	}, [warning]);

	useEffect(() => {
		if (authLoading || !user) {
			setFavourited(false);
			return;
		}

		let cancelled = false;
		setStatusLoading(true);
		isFavourited(recipeId)
			.then((value) => {
				if (!cancelled) setFavourited(value);
			})
			.catch(() => {
				if (!cancelled) setFavourited(false);
			})
			.finally(() => {
				if (!cancelled) setStatusLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [authLoading, user, recipeId]);

	const handleClick = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (authLoading) return;

		if (!user) {
			const next = encodeURIComponent(pathname);
			router.push(`/login?next=${next}`);
			return;
		}

		setToggling(true);
		setWarning(null);

		try {
			if (favourited) {
				await removeFavourite(recipeId);
				setFavourited(false);
			} else {
				await addFavourite(recipeId);
				setFavourited(true);
			}
			router.refresh();
		} catch (err) {
			setWarning(
				getUserFacingErrorMessage(
					err,
					"Couldn't update your favourites. Please try again.",
				),
			);
		} finally {
			setToggling(false);
		}
	};

	const label = favourited ? "Remove from Favourites" : "Add to Favourites";
	const busy = authLoading || statusLoading || toggling;

	return (
		<div className={className}>
			<Button
				variant={size === "sm" ? "ghost" : "outline"}
				size={size}
				onClick={handleClick}
				disabled={busy}
				aria-pressed={favourited}
				aria-label={label}
				className={cn(
					size === "sm" && "self-start px-0 text-accent hover:bg-transparent hover:text-accent-hover",
					favourited && size === "md" && "border-accent text-accent",
					favourited && size === "sm" && "text-accent",
				)}
			>
				<HeartIcon filled={favourited} />
				{size === "md" ? label : (favourited ? "Favourited" : "Favourite")}
			</Button>
			{warning && (
				<p
					role="alert"
					className="mt-2 max-w-xs rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200"
				>
					{warning}
				</p>
			)}
		</div>
	);
}
