export type Instruction =
	| { action: "click"; id: string }
	| { action: "navigate"; route: string }
	| { action: "highlight"; id: string }
	| { action: "scroll"; id: string }
	| { action: "fillInput"; id: string; value: string };
