import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "ai11y — A structured UI context layer for AI agents";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Load Geist WOFF from @fontsource/geist (Satori supports WOFF, not WOFF2). Path at runtime to avoid bundler resolving .woff. */
async function loadGeistFonts(): Promise<{
	normal: ArrayBuffer;
	bold: ArrayBuffer;
}> {
	const base = path.join(
		process.cwd(),
		"node_modules",
		"@fontsource",
		"geist",
		"files",
	);
	const [normalBuf, boldBuf] = await Promise.all([
		readFile(path.join(base, "geist-latin-400-normal.woff")),
		readFile(path.join(base, "geist-latin-700-normal.woff")),
	]);
	const toArrayBuffer = (b: Buffer): ArrayBuffer =>
		b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
	return { normal: toArrayBuffer(normalBuf), bold: toArrayBuffer(boldBuf) };
}

export default async function Image() {
	const { normal: fontNormal, bold: fontBold } = await loadGeistFonts();

	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				fontFamily: "Geist, sans-serif",
				background:
					"linear-gradient(135deg, rgba(255, 46, 0, 0.06) 0%, transparent 50%, rgba(255, 46, 0, 0.06) 100%)",
				backgroundColor: "#0a0a0a",
			}}
		>
			{/* Subtle grid like the demo (dark) */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					backgroundImage:
						"linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
					backgroundSize: "32px 32px",
				}}
			/>
			{/* Hero box — dark card, same style as ScrollyHero, text only */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					width: 760,
					padding: 64,
					borderRadius: 24,
					backgroundColor: "rgba(18, 18, 18, 0.9)",
					border: "1px solid rgba(255, 255, 255, 0.1)",
					boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
					position: "relative",
					overflow: "hidden",
				}}
			>
				{/* Gradient overlay */}
				<div
					style={{
						position: "absolute",
						inset: 0,
						background:
							"linear-gradient(135deg, rgba(255, 46, 0, 0.08) 0%, transparent 50%, rgba(255, 46, 0, 0.08) 100%)",
						pointerEvents: "none",
					}}
				/>
				<div
					style={{
						position: "relative",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 24,
					}}
				>
					<h1
						style={{
							fontSize: 80,
							fontWeight: 700,
							letterSpacing: "-0.02em",
							background:
								"linear-gradient(90deg, #ff2e00 0%, #e62900 50%, #ff6b4a 100%)",
							backgroundClip: "text",
							color: "transparent",
							margin: 0,
							lineHeight: 1.1,
						}}
					>
						ai11y
					</h1>
					<p
						style={{
							fontSize: 30,
							color: "#a3a3a3",
							margin: 0,
							textAlign: "center",
							lineHeight: 1.2,
						}}
					>
						A structured UI context layer for AI agents.
					</p>
					<p
						style={{
							fontSize: 24,
							color: "#737373",
							margin: 0,
							textAlign: "center",
							lineHeight: 1.45,
						}}
					>
						Makes existing user interfaces understandable and actionable for AI
						agents.
					</p>
				</div>
			</div>
		</div>,
		{
			...size,
			fonts: [
				{ name: "Geist", data: fontNormal, style: "normal", weight: 400 },
				{ name: "Geist", data: fontBold, style: "normal", weight: 700 },
			],
		},
	);
}
