import { ATTRIBUTE_ID, ATTRIBUTE_INTENT, ATTRIBUTE_LABEL } from "@ai11y/core";
import React from "react";

interface MarkerProps {
	id: string;
	label: string;
	intent: string;
	children: React.ReactElement;
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
	if (!ref) return;
	if (typeof ref === "function") {
		ref(value);
		return;
	}
	try {
		(ref as React.MutableRefObject<T | null>).current = value;
	} catch {
		// ignore read-only refs
	}
}

export function Marker({ id, label, intent, children }: MarkerProps) {
	const existingRef = (children.props as { ref?: React.Ref<HTMLElement> }).ref;
	const childWithRef = React.cloneElement(children, {
		ref: (node: HTMLElement | null) => {
			assignRef(existingRef, node);
		},
		[ATTRIBUTE_ID]: id,
		...(label && { [ATTRIBUTE_LABEL]: label }),
		...(intent && { [ATTRIBUTE_INTENT]: intent }),
	} as React.HTMLAttributes<HTMLElement> & {
		[ATTRIBUTE_ID]: string;
		[ATTRIBUTE_LABEL]?: string;
		[ATTRIBUTE_INTENT]?: string;
	});

	return <>{childWithRef}</>;
}
