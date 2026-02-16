import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// So /docs redirects to /docs/ once; relative links in TypeDoc then resolve under /docs/
	trailingSlash: true,
	async rewrites() {
		return [{ source: "/docs/", destination: "/docs/index.html" }];
	},
};

export default nextConfig;
