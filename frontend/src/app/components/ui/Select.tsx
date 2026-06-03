import type { SelectHTMLAttributes, Ref } from "react";
import { cn, hasExplicitWidth } from "./cn";
import { fieldBaseClasses } from "./Input";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
	ref?: Ref<HTMLSelectElement>;
};

export default function Select({
	className,
	children,
	ref,
	...props
}: SelectProps) {
	return (
		<select
			ref={ref}
			className={cn(
				fieldBaseClasses,
				!hasExplicitWidth(className) && "w-full",
				"cursor-pointer pr-8",
				className,
			)}
			{...props}
		>
			{children}
		</select>
	);
}
