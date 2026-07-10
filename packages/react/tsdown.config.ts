import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/index.ts"],
	unbundle: true,
	format: ["esm"],
	dts: true,
	clean: true,
	outDir: "dist",
	deps: {
		neverBundle: [
			"react",
			"react-dom",
			"react/jsx-runtime",
			"@ai11y/ui",
			"@ai11y/core",
		],
	},
});
