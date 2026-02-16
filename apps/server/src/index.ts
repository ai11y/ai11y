import "dotenv/config";
import { ai11yPlugin, type ServerConfig } from "@ai11y/agent/fastify";
import cors from "@fastify/cors";
import Fastify from "fastify";

const apiKey = process.env.OPENAI_API_KEY;

async function start() {
	if (!apiKey) {
		console.error("❌ Error: OPENAI_API_KEY environment variable is required");
		process.exit(1);
	}
	const fastify = Fastify({
		logger: true,
	});

	const isProduction = process.env.NODE_ENV === "production";
	const allowedOriginsList = isProduction
		? process.env.ALLOWED_ORIGINS?.split(",").filter(Boolean) || []
		: null;

	await fastify.register(cors, {
		origin:
			isProduction && allowedOriginsList
				? (origin, cb) => {
						cb(null, origin ? allowedOriginsList.includes(origin) : false);
					}
				: true, // Allow all in dev
		credentials: true,
	});

	const config: ServerConfig = {
		provider: "openai",
		apiKey,
		model: process.env.LLM_MODEL,
		temperature: process.env.LLM_TEMPERATURE
			? Number(process.env.LLM_TEMPERATURE)
			: undefined,
		baseURL: process.env.OPENAI_BASE_URL,
	};

	await fastify.register(ai11yPlugin, {
		config,
	});

	try {
		const port = Number(process.env.PORT) || 3000;
		await fastify.listen({ port, host: "0.0.0.0" });
		console.log(`🚀 Server listening on http://localhost:${port}`);
		console.log(`📡 Agent endpoint: http://localhost:${port}/ai11y/agent`);

		const corsInfo = isProduction
			? allowedOriginsList && allowedOriginsList.length > 0
				? `allowed origins: ${allowedOriginsList.join(", ")}`
				: "no origins allowed (configure ALLOWED_ORIGINS)"
			: "all origins (*)";
		console.log(`🌐 CORS: ${corsInfo}`);

		console.log(`🤖 LLM Provider: OpenAI (${config.model || "gpt-5-nano"})`);
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
}

start();
