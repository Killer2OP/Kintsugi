"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Command, Keyboard } from "lucide-react";

interface ShortcutItem {
    keys: string[];
    description: string;
}

interface ShortcutGroup {
    title: string;
    shortcuts: ShortcutItem[];
}

const shortcutGroups: ShortcutGroup[] = [
    {
        title: "Navigation",
        shortcuts: [
            { keys: ["Alt", "H"], description: "Go to Home" },
            { keys: ["Alt", "D"], description: "Go to Dashboard" },
            { keys: ["Alt", "A"], description: "Go to Analytics" },
            { keys: ["Alt", "F"], description: "Go to Failures" },
        ],
    },
    {
        title: "General",
        shortcuts: [
            { keys: ["Ctrl", "K"], description: "Open Command Palette" },
            { keys: ["?"], description: "Show Keyboard Shortcuts" },
            { keys: ["Esc"], description: "Close Dialog / Modal" },
        ],
    },
];

interface KeyboardShortcutsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function KeyboardKey({ children }: { children: React.ReactNode }) {
    return (
        <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded shadow-sm">
            {children}
        </kbd>
    );
}

export function KeyboardShortcutsModal({
    open,
    onOpenChange,
}: KeyboardShortcutsModalProps) {
    // Close on Escape
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && open) {
                onOpenChange(false);
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [open, onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Keyboard className="w-5 h-5" />
                        Keyboard Shortcuts
                    </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6 mt-4">
                    {shortcutGroups.map((group) => (
                        <div key={group.title}>
                            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
                                {group.title}
                            </h3>
                            <div className="space-y-2">
                                {group.shortcuts.map((shortcut, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                                    >
                                        <span className="text-sm text-zinc-700 dark:text-zinc-300">
                                            {shortcut.description}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            {shortcut.keys.map((key, keyIdx) => (
                                                <React.Fragment key={keyIdx}>
                                                    <KeyboardKey>{key}</KeyboardKey>
                                                    {keyIdx < shortcut.keys.length - 1 && (
                                                        <span className="text-zinc-400 text-xs">
                                                            +
                                                        </span>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                        <Command className="w-3 h-3" />
                        <span>Press</span>
                        <KeyboardKey>?</KeyboardKey>
                        <span>anytime to show this dialog</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
