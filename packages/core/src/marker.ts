import {
	ATTRIBUTE_SENSITIVE,
	getAllMarkersSelector,
	getMarkerId,
	getMarkerIntent,
	getMarkerLabel,
} from "./util/attributes.js";
import { formatMarkerId } from "./util/format.js";

/**
 * Marker information for UI elements
 */
export interface Marker {
	id: string;
	label: string;
	intent: string;
	elementType: string;
	/** Current value for input/textarea elements */
	value?: string;
	/** Selected value(s) for select elements */
	selectedOptions?: string[];
	/** All available options for select elements */
	options?: Array<{ value: string; label: string }>;
}

/**
 * Gets the document body in a type-safe way
 * Returns null if not in a browser environment
 */
function getDocumentBody(): Element | null {
	if (typeof document === "undefined") {
		return null;
	}
	return document.body;
}

/**
 * Finds an input or textarea element within a marked element
 * Handles both direct input elements and nested inputs (when Mark wraps the input)
 */
function findInputElement(
	element: Element,
): HTMLInputElement | HTMLTextAreaElement | null {
	if (
		element instanceof HTMLInputElement ||
		element instanceof HTMLTextAreaElement
	) {
		return element;
	}
	if (element instanceof HTMLElement) {
		const nestedInput = element.querySelector("input, textarea");
		if (
			nestedInput instanceof HTMLInputElement ||
			nestedInput instanceof HTMLTextAreaElement
		) {
			return nestedInput;
		}
	}
	return null;
}

/**
 * Finds a select element within a marked element
 * Handles both direct select elements and nested selects (when Mark wraps the select)
 */
function findSelectElement(element: Element): HTMLSelectElement | null {
	if (element instanceof HTMLSelectElement) {
		return element;
	}
	if (element instanceof HTMLElement) {
		const nestedSelect = element.querySelector("select");
		if (nestedSelect instanceof HTMLSelectElement) {
			return nestedSelect;
		}
	}
	return null;
}

/**
 * Checks if an input element contains sensitive data that should be redacted
 * from the UI context (passwords, credit cards, hidden fields, etc.)
 *
 * @param inputElement - The input or textarea element to check
 * @returns True if the input contains sensitive data
 */
function isSensitiveInput(
	inputElement: HTMLInputElement | HTMLTextAreaElement,
): boolean {
	// Check input type
	if (inputElement instanceof HTMLInputElement) {
		const type = inputElement.type.toLowerCase();
		if (type === "password" || type === "hidden") {
			return true;
		}
	}

	// Check autocomplete attribute for sensitive patterns
	const autocomplete = inputElement.getAttribute("autocomplete")?.toLowerCase();
	if (autocomplete) {
		const sensitiveAutocompletePaths = [
			"current-password",
			"new-password",
			"cc-number",
			"cc-csc",
			"cc-exp",
			"cc-exp-month",
			"cc-exp-year",
		];
		if (
			sensitiveAutocompletePaths.some((path) => autocomplete.includes(path))
		) {
			return true;
		}
	}

	// Check for custom sensitive marker attribute
	if (inputElement.getAttribute(ATTRIBUTE_SENSITIVE) === "true") {
		return true;
	}

	// Check parent element for sensitive marker attribute
	const parent = inputElement.parentElement;
	if (parent && parent.getAttribute(ATTRIBUTE_SENSITIVE) === "true") {
		return true;
	}

	return false;
}

/**
 * Extracts the value from an input or textarea element
 * Redacts sensitive values (passwords, credit cards, etc.) for privacy
 */
function extractInputValue(element: Element): string | undefined {
	const inputElement = findInputElement(element);
	if (!inputElement) {
		return undefined;
	}
	if (isSensitiveInput(inputElement)) {
		return "[REDACTED]";
	}
	return inputElement.value;
}

/**
 * Extracts options and selected values from a select element
 */
function extractSelectData(element: Element): {
	options?: Array<{ value: string; label: string }>;
	selectedOptions?: string[];
} {
	const selectElement = findSelectElement(element);
	if (!selectElement) {
		return {};
	}

	const options: Array<{ value: string; label: string }> = [];
	for (let i = 0; i < selectElement.options.length; i++) {
		const option = selectElement.options[i];
		options.push({
			value: option.value,
			label: option.text,
		});
	}

	const selectedOptions: string[] = [];
	if (selectElement.multiple) {
		for (let i = 0; i < selectElement.selectedOptions.length; i++) {
			selectedOptions.push(selectElement.selectedOptions[i].value);
		}
	} else {
		if (selectElement.value) {
			selectedOptions.push(selectElement.value);
		}
	}

	return {
		options: options.length > 0 ? options : undefined,
		selectedOptions: selectedOptions.length > 0 ? selectedOptions : undefined,
	};
}

/**
 * Scans the DOM for elements with data-ai-* attributes and returns markers
 *
 * @param root - Optional DOM root element to scan (defaults to document.body)
 * @returns Array of Marker objects found in the DOM
 *
 * @example
 * ```ts
 * const markers = getMarkers();
 * // Scans document.body for data-ai-* attributes
 * ```
 */
export function getMarkers(root?: Element): Marker[] {
	const scanRoot = root ?? getDocumentBody();

	if (!scanRoot) {
		return [];
	}

	const elements = scanRoot.querySelectorAll(getAllMarkersSelector());
	const markers: Marker[] = [];
	for (let i = 0; i < elements.length; i++) {
		const element = elements[i];
		const id = getMarkerId(element);
		if (!id) continue;

		const label = getMarkerLabel(element) || formatMarkerId(id);
		const intent = getMarkerIntent(element) || "";
		const elementType = element.tagName.toLowerCase();

		const marker: Marker = {
			id,
			label,
			intent,
			elementType,
		};

		const inputValue = extractInputValue(element);
		if (inputValue !== undefined) {
			marker.value = inputValue;
		}

		const selectData = extractSelectData(element);
		if (selectData.options !== undefined) {
			marker.options = selectData.options;
		}
		if (selectData.selectedOptions !== undefined) {
			marker.selectedOptions = selectData.selectedOptions;
		}

		markers.push(marker);
	}

	return markers;
}
