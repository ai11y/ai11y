import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/index.ts", "src/fastify.ts"],
	format: ["esm"],
	dts: true,
	unbundle: true,
	sourcemap: true,
	clean: true,
	outDir: "dist",
});
