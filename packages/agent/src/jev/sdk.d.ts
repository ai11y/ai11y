declare module "@typesafe-ai/sdk" {
	export class TypeSafeClient {
		constructor(config?: unknown);
		systemOne(args: unknown): Promise<unknown>;
	}
	export function choice(
		prompt: string,
		options: Record<string, string>,
	): unknown;
}
