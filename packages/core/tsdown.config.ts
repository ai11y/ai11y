import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/index.ts", "src/jev/index.ts"],
	unbundle: true,
	format: ["esm"],
	dts: true,
	clean: true,
	outDir: "dist",
});
