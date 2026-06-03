import type { HTMLAttributes, Ref } from "react";
import { cn } from "./cn";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
	ref?: Ref<HTMLDivElement>;
};

export default function Card({ className, ref, ...props }: CardProps) {
	return (
		<div
			ref={ref}
			className={cn(
				"rounded-xl border border-border bg-surface p-5 sm:p-6",
				className,
			)}
			{...props}
		/>
	);
}
