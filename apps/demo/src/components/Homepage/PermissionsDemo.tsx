import { setState } from "@ai11y/core";
import { useEffect } from "react";
import { MarkerWithHighlight as Marker } from "@/components/Shared/MarkerWithHighlight";
import { SuggestionSection } from "@/components/Shared/SuggestionSection";

const PERMISSIONS = {
	canDelete: false,
	canExport: true,
	canInvite: true,
	canEdit: true,
	role: "editor",
	plan: "pro",
} as const;

export function PermissionsDemoWithSuggestions({
	onSuggestion,
}: {
	onSuggestion: (s: string) => void;
}) {
	const permissions = PERMISSIONS;

	useEffect(() => {
		setState(permissions);
	}, [permissions]);

	return (
		<div className="space-y-4">
			<div className="text-sm text-muted-foreground mb-3">
				Give your agent knowledge beyond the DOM. Expose permissions and
				capabilities so your agent can answer questions about what actions are
				allowed:
			</div>

			<div className="space-y-3 rounded-xl border border-border/50 bg-muted/30 p-4">
				<div className="mb-2">
					<div className="text-xs font-medium text-muted-foreground mb-1">
						Role
					</div>
					<div className="text-sm font-mono text-foreground">
						{permissions.role}
					</div>
				</div>
				<div className="mb-2">
					<div className="text-xs font-medium text-muted-foreground mb-1">
						Plan
					</div>
					<div className="text-sm font-mono text-foreground">
						{permissions.plan}
					</div>
				</div>
			</div>

			<div className="space-y-2">
				<div className="text-xs font-medium text-muted-foreground mb-2">
					Actions
				</div>
				<div className="grid grid-cols-2 gap-2">
					<Marker
						id="permissions_demo_export"
						label="Export Data"
						intent="Export project data"
					>
						<button
							type="button"
							disabled={!permissions.canExport}
							className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
								permissions.canExport
									? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
									: "bg-muted/50 text-muted-foreground/50 border border-border/30 cursor-not-allowed"
							}`}
						>
							Export
						</button>
					</Marker>
					<Marker
						id="permissions_demo_invite"
						label="Invite Users"
						intent="Invite new users to the project"
					>
						<button
							type="button"
							disabled={!permissions.canInvite}
							className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
								permissions.canInvite
									? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
									: "bg-muted/50 text-muted-foreground/50 border border-border/30 cursor-not-allowed"
							}`}
						>
							Invite
						</button>
					</Marker>
					<Marker
						id="permissions_demo_edit"
						label="Edit Settings"
						intent="Edit project settings"
					>
						<button
							type="button"
							disabled={!permissions.canEdit}
							className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
								permissions.canEdit
									? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
									: "bg-muted/50 text-muted-foreground/50 border border-border/30 cursor-not-allowed"
							}`}
						>
							Edit
						</button>
					</Marker>
					<Marker
						id="permissions_demo_delete"
						label="Delete Project"
						intent="Delete the entire project"
					>
						<button
							type="button"
							disabled={!permissions.canDelete}
							className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
								permissions.canDelete
									? "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20"
									: "bg-muted/50 text-muted-foreground/50 border border-border/30 cursor-not-allowed"
							}`}
						>
							Delete
						</button>
					</Marker>
				</div>
				{!permissions.canDelete && (
					<p className="text-xs text-muted-foreground italic mt-2">
						Only owners can delete projects
					</p>
				)}
			</div>
			<SuggestionSection
				suggestions={[
					"Can I delete this project?",
					"What permissions do I have?",
					"Am I allowed to export data?",
					"What is my role?",
				]}
				onSuggestion={onSuggestion}
			/>
		</div>
	);
}
