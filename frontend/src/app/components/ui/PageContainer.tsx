import type { ElementType, HTMLAttributes } from "react";
import { cn } from "./cn";

export type PageContainerProps = HTMLAttributes<HTMLElement> & {
	as?: ElementType;
};

/** Consistent max-width + responsive padding wrapper for page content. */
export default function PageContainer({
	as: Tag = "main",
	className,
	children,
	...props
}: PageContainerProps) {
	return (
		<Tag
			className={cn(
				"mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12",
				className,
			)}
			{...props}
		>
			{children}
		</Tag>
	);
}
