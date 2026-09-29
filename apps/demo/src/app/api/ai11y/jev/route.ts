import { type JevPlanRequest, plan } from "@ai11y/agent/jev";
import { NextResponse } from "next/server";
export async function POST(request: Request) {
	const apiKey = process.env.TYPESAFE_API_KEY;
	if (!apiKey)
		return NextResponse.json(
			{ error: "JEV is not configured" },
			{ status: 503 },
		);
	let body: JevPlanRequest;
	try {
		body = (await request.json()) as JevPlanRequest;
	} catch {
		return NextResponse.json(
			{ error: "Request body must be valid JSON" },
			{ status: 400 },
		);
	}
	try {
		return NextResponse.json(
			await plan(body, {
				apiKey,
				model: process.env.TYPESAFE_MODEL || "jev-latest",
			}),
		);
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "JEV request failed";
		console.error("JEV request failed", message);
		return NextResponse.json(
			{ error: message },
			{ status: message.includes("Invalid") ? 400 : 500 },
		);
	}
}
