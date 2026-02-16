import { Badge } from "@ai11y/ui";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MarkerWithHighlight as Marker } from "@/components/Shared/MarkerWithHighlight";
import { SuggestionSection } from "@/components/Shared/SuggestionSection";

export function NavigationDemo({
	onSuggestion,
}: {
	onSuggestion: (s: string) => void;
}) {
	const pathname = usePathname();
	const router = useRouter();

	const routes = [
		{ path: "/", label: "Home", icon: "🏠" },
		{ path: "/billing/", label: "Billing", icon: "💳" },
		{ path: "/integrations/", label: "Integrations", icon: "🔌" },
	];

	const handleRouteClick = (
		e: React.MouseEvent<HTMLAnchorElement>,
		path: string,
	) => {
		e.preventDefault();
		if (path !== pathname) {
			router.push(path, { scroll: false });
		}
	};

	return (
		<div className="space-y-4">
			<div className="text-sm text-muted-foreground mb-3">
				Give your agent access to your routes:
			</div>
			<div className="space-y-2">
				{routes.map((route) => {
					const isCurrent = pathname === route.path;
					return (
						<Marker
							key={route.path}
							id={`nav_route_${route.path.replace("/", "") || "home"}`}
							label={`${route.label} Route`}
							intent={`Navigate to ${route.label} page`}
						>
							<Link
								href={route.path}
								onClick={(e) => handleRouteClick(e, route.path)}
								className={`flex items-center gap-3 px-4 py-3 rounded-sm border transition-all ${
									isCurrent
										? "border-primary bg-primary/10 text-foreground"
										: "border-border/50 bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted/50"
								}`}
							>
								<span className="text-lg">{route.icon}</span>
								<span className="font-medium">{route.label}</span>
								{isCurrent && (
									<Badge variant="primary" className="ml-auto">
										current
									</Badge>
								)}
							</Link>
						</Marker>
					);
				})}
			</div>
			<SuggestionSection
				suggestions={["go to billing", "navigate to integrations"]}
				onSuggestion={onSuggestion}
			/>
		</div>
	);
}
