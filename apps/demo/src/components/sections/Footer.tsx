import { Github } from "lucide-react";

export function Footer() {
	return (
		<footer
			id="site-footer"
			className="border-t border-border bg-muted/30 py-12 px-6"
		>
			<div className="max-w-6xl mx-auto text-center space-y-4">
				<p className="text-muted-foreground">
					Built with ai11y — A structured UI context layer for AI agents.
				</p>
				<div className="flex items-center justify-center gap-4 text-sm">
					<a
						href="https://github.com/maerzhase/ui4ai"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1.5 text-primary hover:underline"
					>
						<Github className="h-4 w-4" aria-hidden />
						GitHub
					</a>
					<span className="text-muted-foreground">•</span>
					<a
						href="/docs/"
						target="_blank"
						rel="noopener noreferrer"
						className="text-primary hover:underline"
					>
						API Docs
					</a>
				</div>
			</div>
		</footer>
	);
}
