import { Send } from "lucide-react";
import type React from "react";
import { Button } from "./Button.js";

export interface ChatInputProps {
	value: string;
	onChange: (value: string) => void;
	onSubmit: (e: React.FormEvent) => void;
	disabled?: boolean;
	placeholder?: string;
	inputRef?: React.RefObject<HTMLInputElement>;
	autoFocus?: boolean;
}

export function ChatInput({
	value,
	onChange,
	onSubmit,
	disabled = false,
	placeholder = "Ask something...",
	inputRef,
	autoFocus: _autoFocus,
}: ChatInputProps) {
	return (
		<form className="px-3 py-2.5 border-t border-border/50" onSubmit={onSubmit}>
			<div className="flex gap-1.5 items-center">
				<input
					ref={inputRef}
					type="text"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
					disabled={disabled}
					className="flex-1 px-2.5 py-1.5 border-none rounded-xs text-[13px] outline-none bg-muted/50 text-foreground placeholder:text-muted-foreground/60 focus:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				/>
				<Button
					type="submit"
					disabled={!value.trim() || disabled}
					className={`p-1.5 bg-foreground text-background border-none rounded-xs transition-all ${
						value.trim() && !disabled
							? "cursor-pointer opacity-100 hover:opacity-80 active:scale-95"
							: "cursor-not-allowed opacity-30"
					}`}
				>
					<Send size={14} aria-hidden />
				</Button>
			</div>
		</form>
	);
}
