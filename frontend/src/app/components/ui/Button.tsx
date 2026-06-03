import type { ButtonHTMLAttributes, Ref } from "react";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: ButtonVariant;
	size?: ButtonSize;
	ref?: Ref<HTMLButtonElement>;
};

const base =
	"inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
	primary: "bg-accent text-white hover:bg-accent-hover",
	outline: "border border-border bg-transparent text-ink hover:bg-surface",
	ghost: "bg-transparent text-ink hover:bg-surface",
	danger: "bg-red-600 text-white hover:bg-red-700",
};

const sizes: Record<ButtonSize, string> = {
	sm: "text-sm px-3 py-1.5",
	md: "text-sm px-4 py-2",
};

export default function Button({
	variant = "primary",
	size = "md",
	className,
	type = "button",
	ref,
	...props
}: ButtonProps) {
	return (
		<button
			ref={ref}
			type={type}
			className={cn(base, variants[variant], sizes[size], className)}
			{...props}
		/>
	);
}
