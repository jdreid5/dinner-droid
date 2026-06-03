import type { ElementType, HTMLAttributes } from "react";
import { cn } from "./cn";

export type SectionHeadingProps = HTMLAttributes<HTMLElement> & {
	/** The element to render. Defaults to `p` for the eyebrow label. */
	as?: ElementType;
};

/**
 * The recurring uppercase "eyebrow" label used above section titles.
 * e.g. <SectionHeading>This week</SectionHeading>
 */
export default function SectionHeading({
	as: Tag = "p",
	className,
	children,
	...props
}: SectionHeadingProps) {
	return (
		<Tag
			className={cn(
				"text-xs font-medium uppercase tracking-wide text-muted",
				className,
			)}
			{...props}
		>
			{children}
		</Tag>
	);
}
