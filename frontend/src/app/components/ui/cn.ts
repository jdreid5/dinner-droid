/** Tiny className joiner — filters out falsy values. No deps. */
export function cn(
	...classes: Array<string | false | null | undefined>
): string {
	return classes.filter(Boolean).join(" ");
}

const WIDTH_CLASS = /\b(!?)(w-|min-w-|max-w-|size-)/;

/** True when className sets an explicit width (so default w-full can be skipped). */
export function hasExplicitWidth(className?: string | null): boolean {
	if (!className) return false;
	return WIDTH_CLASS.test(className);
}
