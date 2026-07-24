"use client";

import { useEffect, useState } from "react";
import Button from "@/app/components/ui/Button";

const STORAGE_KEY = "dd-install-prompt-dismissed";

export default function InstallPrompt() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		try {
			if (localStorage.getItem(STORAGE_KEY) === "1") return;
		} catch {
			/* ignore */
		}

		const isStandalone =
			window.matchMedia("(display-mode: standalone)").matches ||
			("standalone" in navigator &&
				(navigator as Navigator & { standalone?: boolean }).standalone ===
					true);

		if (isStandalone) return;

		const isIOS =
			/iPad|iPhone|iPod/.test(navigator.userAgent) ||
			(navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

		if (isIOS) setVisible(true);
	}, []);

	function dismiss() {
		try {
			localStorage.setItem(STORAGE_KEY, "1");
		} catch {
			/* ignore */
		}
		setVisible(false);
	}

	if (!visible) return null;

	return (
		<div
			role="region"
			aria-label="Install Dinner Droid"
			className="border-t border-border bg-surface"
		>
			<div className="mx-auto flex w-full max-w-5xl items-start justify-between gap-4 px-4 py-3 sm:px-6">
				<p className="text-sm text-muted">
					Install Dinner Droid: tap Share
					<span aria-hidden="true"> ⎋ </span>
					then &ldquo;Add to Home Screen&rdquo;
					<span aria-hidden="true"> ➕</span>.
				</p>
				<Button
					variant="ghost"
					size="sm"
					onClick={dismiss}
					aria-label="Dismiss install tip"
					className="shrink-0 text-muted"
				>
					Dismiss
				</Button>
			</div>
		</div>
	);
}
