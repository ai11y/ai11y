import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** Serve /docs and /docs/* from public/docs in dev (TypeDoc output). */
function docsPlugin() {
	return {
		name: "docs-dev-server",
		configureServer(server: {
			middlewares: {
				use: (
					fn: (
						req: { url?: string; method?: string },
						res: {
							setHeader: (k: string, v: string) => void;
							end: (body?: string) => void;
							statusCode: number;
						},
						next: () => void,
					) => void,
				) => void;
			};
			config: { publicDir: string };
		}) {
			server.middlewares.use(
				(
					req: { url?: string; method?: string },
					res: {
						setHeader: (k: string, v: string) => void;
						end: (body?: string) => void;
						statusCode: number;
					},
					next: () => void,
				) => {
					const url = req.url?.split("?")[0] ?? "";
					if (req.method !== "GET" && req.method !== "HEAD") return next();
					const docsDir = join(server.config.publicDir, "docs");
					if (!existsSync(docsDir)) return next();
					let path = decodeURIComponent(url);
					if (path === "/docs") {
						res.setHeader("Location", "/docs/");
						res.statusCode = 301;
						res.end();
						return;
					}
					if (path === "/docs/" || path === "/docs") {
						path = "/docs/index.html";
					}
					if (!path.startsWith("/docs/")) return next();
					const filePath = join(docsDir, path.slice("/docs/".length));
					if (!existsSync(filePath)) return next();
					const stat = statSync(filePath);
					if (stat.isDirectory()) return next();
					const content = readFileSync(filePath);
					const ext = path.slice(path.lastIndexOf("."));
					const types: Record<string, string> = {
						".html": "text/html",
						".js": "application/javascript",
						".css": "text/css",
						".json": "application/json",
						".svg": "image/svg+xml",
						".ico": "image/x-icon",
					};
					res.setHeader(
						"Content-Type",
						types[ext] ?? "application/octet-stream",
					);
					res.end(content);
				},
			);
		},
	};
}

// https://vite.dev/config/
export default defineConfig({
	plugins: [docsPlugin(), react(), tailwindcss()],
});
