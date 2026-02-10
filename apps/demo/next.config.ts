import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	async rewrites() {
		return [
			{ source: "/docs", destination: "/docs/index.html" },
			{ source: "/docs/", destination: "/docs/index.html" },
		];
	},
};

export default nextConfig;
