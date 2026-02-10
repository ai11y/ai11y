import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClientProviders } from "@/ClientProviders";
import "./globals.css";

const geistSans = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-geist-mono",
});

export const metadata: Metadata = {
	title: "ai11y - A structured UI context layer for AI agents",
	description:
		"A structured UI context layer for AI agents to navigate, interact with, and understand web applications",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head />
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${geistSans.className} antialiased`}
			>
				<ClientProviders>{children}</ClientProviders>
			</body>
		</html>
	);
}
