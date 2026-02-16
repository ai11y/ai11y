/**
 * Server configuration
 */
export interface ServerConfig {
	provider: "openai";
	apiKey: string;
	model?: string;
	temperature?: number;
	baseURL?: string;
}
