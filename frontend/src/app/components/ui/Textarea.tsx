import type { TextareaHTMLAttributes, Ref } from "react";
import { cn } from "./cn";
import { fieldClasses } from "./Input";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
	ref?: Ref<HTMLTextAreaElement>;
};

export default function Textarea({ className, ref, ...props }: TextareaProps) {
	return (
		<textarea
			ref={ref}
			className={cn(fieldClasses, "min-h-24 resize-y", className)}
			{...props}
		/>
	);
}
