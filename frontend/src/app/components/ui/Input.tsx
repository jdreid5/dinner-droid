import type { InputHTMLAttributes, Ref } from "react";
import { cn, hasExplicitWidth } from "./cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
	ref?: Ref<HTMLInputElement>;
};

export const fieldBaseClasses =
	"rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50";

export const fieldClasses = `${fieldBaseClasses} w-full`;

export default function Input({ className, ref, ...props }: InputProps) {
	return (
		<input
			ref={ref}
			className={cn(
				fieldBaseClasses,
				!hasExplicitWidth(className) && "w-full",
				className,
			)}
			{...props}
		/>
	);
}
