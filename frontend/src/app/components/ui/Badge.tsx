import type { HTMLAttributes, Ref } from "react";
import { cn } from "./cn";

export type BadgeVariant = "neutral" | "accent" | "secondary";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
	variant?: BadgeVariant;
	ref?: Ref<HTMLSpanElement>;
};

const variants: Record<BadgeVariant, string> = {
	neutral: "bg-background text-muted border border-border",
	accent: "bg-accent/10 text-accent border border-accent/20",
	secondary: "bg-secondary/10 text-secondary border border-secondary/20",
};

export default function Badge({
	variant = "neutral",
	className,
	ref,
	...props
}: BadgeProps) {
	return (
		<span
			ref={ref}
			className={cn(
				"inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
				variants[variant],
				className,
			)}
			{...props}
		/>
	);
}
