"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    FileText,
    GitBranch,
    Wrench,
    LayoutDashboard,
    BarChart3,
    AlertTriangle,
    Settings,
    ArrowRight,
    Command,
} from "lucide-react";

interface CommandItem {
    id: string;
    title: string;
    description?: string;
    icon: React.ReactNode;
    category: "navigation" | "failures" | "repositories" | "fixes" | "actions";
    action: () => void;
    keywords?: string[];
}

interface CommandPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
    const router = useRouter();
    const [query, setQuery] = React.useState("");
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const commands: CommandItem[] = React.useMemo(
        () => [
            // Navigation
            {
                id: "nav-home",
                title: "Go to Home",
                description: "Navigate to the landing page",
                icon: <FileText className="w-4 h-4" />,
                category: "navigation",
                action: () => router.push("/"),
                keywords: ["home", "landing", "main"],
            },
            {
                id: "nav-dashboard",
                title: "Go to Dashboard",
                description: "View the main dashboard",
                icon: <LayoutDashboard className="w-4 h-4" />,
                category: "navigation",
                action: () => router.push("/dashboard"),
                keywords: ["dashboard", "overview", "main"],
            },
            {
                id: "nav-analytics",
                title: "Go to Analytics",
                description: "View advanced analytics",
                icon: <BarChart3 className="w-4 h-4" />,
                category: "navigation",
                action: () => router.push("/analytics"),
                keywords: ["analytics", "charts", "stats", "metrics"],
            },
            {
                id: "nav-failures",
                title: "Go to Failures",
                description: "View all CI/CD failures",
                icon: <AlertTriangle className="w-4 h-4" />,
                category: "navigation",
                action: () => router.push("/failures"),
                keywords: ["failures", "errors", "issues", "problems"],
            },
            {
                id: "nav-fixes",
                title: "Go to Fixes",
                description: "View pending and applied fixes",
                icon: <Wrench className="w-4 h-4" />,
                category: "navigation",
                action: () => router.push("/fixes"),
                keywords: ["fixes", "solutions", "patches"],
            },
            {
                id: "nav-repository",
                title: "Go to Repositories",
                description: "View repository analytics",
                icon: <GitBranch className="w-4 h-4" />,
                category: "navigation",
                action: () => router.push("/repository"),
                keywords: ["repository", "repo", "git"],
            },
            {
                id: "nav-settings",
                title: "Go to Settings",
                description: "Configure application settings",
                icon: <Settings className="w-4 h-4" />,
                category: "navigation",
                action: () => router.push("/settings"),
                keywords: ["settings", "config", "preferences"],
            },
        ],
        [router]
    );

    const filteredCommands = React.useMemo(() => {
        if (!query) return commands;

        const lowerQuery = query.toLowerCase();
        return commands.filter((cmd) => {
            const matchesTitle = cmd.title.toLowerCase().includes(lowerQuery);
            const matchesDescription = cmd.description
                ?.toLowerCase()
                .includes(lowerQuery);
            const matchesKeywords = cmd.keywords?.some((k) =>
                k.toLowerCase().includes(lowerQuery)
            );
            return matchesTitle || matchesDescription || matchesKeywords;
        });
    }, [commands, query]);

    const groupedCommands = React.useMemo(() => {
        const groups: Record<string, CommandItem[]> = {};
        filteredCommands.forEach((cmd) => {
            if (!groups[cmd.category]) {
                groups[cmd.category] = [];
            }
            groups[cmd.category].push(cmd);
        });
        return groups;
    }, [filteredCommands]);

    const categoryLabels: Record<string, string> = {
        navigation: "Navigation",
        failures: "Failures",
        repositories: "Repositories",
        fixes: "Fixes",
        actions: "Actions",
    };

    React.useEffect(() => {
        if (open) {
            setQuery("");
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [open]);

    React.useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) =>
                prev < filteredCommands.length - 1 ? prev + 1 : 0
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) =>
                prev > 0 ? prev - 1 : filteredCommands.length - 1
            );
        } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
            e.preventDefault();
            filteredCommands[selectedIndex].action();
            onOpenChange(false);
        }
    };

    const executeCommand = (cmd: CommandItem) => {
        cmd.action();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 gap-0 max-w-xl overflow-hidden bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-zinc-200 dark:border-zinc-800 shadow-2xl">
                <DialogTitle className="sr-only">Command Palette</DialogTitle>
                
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 border-b border-zinc-200 dark:border-zinc-800">
                    <Search className="w-5 h-5 text-zinc-400" />
                    <Input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a command or search..."
                        className="h-14 border-0 focus-visible:ring-0 bg-transparent text-base placeholder:text-zinc-400"
                    />
                    <Badge
                        variant="outline"
                        className="px-2 py-1 text-xs font-mono bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                    >
                        ESC
                    </Badge>
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto p-2">
                    {filteredCommands.length === 0 ? (
                        <div className="py-12 text-center text-zinc-500">
                            <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No results found</p>
                            <p className="text-xs text-zinc-400 mt-1">
                                Try a different search term
                            </p>
                        </div>
                    ) : (
                        Object.entries(groupedCommands).map(([category, items]) => (
                            <div key={category} className="mb-2">
                                <div className="px-3 py-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                    {categoryLabels[category]}
                                </div>
                                {items.map((cmd) => {
                                    const globalIndex = filteredCommands.indexOf(cmd);
                                    const isSelected = globalIndex === selectedIndex;

                                    return (
                                        <button
                                            key={cmd.id}
                                            onClick={() => executeCommand(cmd)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 group ${
                                                isSelected
                                                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                                            }`}
                                        >
                                            <div
                                                className={`p-2 rounded-lg transition-colors ${
                                                    isSelected
                                                        ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                                                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                                                }`}
                                            >
                                                {cmd.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm">
                                                    {cmd.title}
                                                </div>
                                                {cmd.description && (
                                                    <div className="text-xs text-zinc-500 truncate">
                                                        {cmd.description}
                                                    </div>
                                                )}
                                            </div>
                                            <ArrowRight
                                                className={`w-4 h-4 transition-all ${
                                                    isSelected
                                                        ? "opacity-100 translate-x-0"
                                                        : "opacity-0 -translate-x-2"
                                                }`}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-xs text-zinc-500">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                            <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 font-mono">↑↓</kbd>
                            Navigate
                        </span>
                        <span className="flex items-center gap-1.5">
                            <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 font-mono">↵</kbd>
                            Select
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Command className="w-3 h-3" />
                        <span>Command Palette</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Hook for global keyboard shortcut
export function useCommandPalette() {
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    return { open, setOpen };
}
