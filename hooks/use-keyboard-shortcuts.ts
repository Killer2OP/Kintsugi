"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

interface ShortcutConfig {
    key: string;
    ctrl?: boolean;
    meta?: boolean;
    alt?: boolean;
    shift?: boolean;
    action: () => void;
    description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            for (const shortcut of shortcuts) {
                const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : true;
                const metaMatch = shortcut.meta ? e.metaKey : true;
                const altMatch = shortcut.alt ? e.altKey : !e.altKey;
                const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
                const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

                if (ctrlMatch && metaMatch && altMatch && shiftMatch && keyMatch) {
                    e.preventDefault();
                    shortcut.action();
                    break;
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [shortcuts]);
}

// Predefined shortcuts
export function useGlobalShortcuts() {
    const router = useRouter();
    const [showShortcutsModal, setShowShortcutsModal] = React.useState(false);

    const shortcuts: ShortcutConfig[] = React.useMemo(
        () => [
            {
                key: "h",
                alt: true,
                action: () => router.push("/"),
                description: "Go to Home",
            },
            {
                key: "d",
                alt: true,
                action: () => router.push("/dashboard"),
                description: "Go to Dashboard",
            },
            {
                key: "a",
                alt: true,
                action: () => router.push("/analytics"),
                description: "Go to Analytics",
            },
            {
                key: "f",
                alt: true,
                action: () => router.push("/failures"),
                description: "Go to Failures",
            },
            {
                key: "?",
                action: () => setShowShortcutsModal(true),
                description: "Show keyboard shortcuts",
            },
        ],
        [router]
    );

    useKeyboardShortcuts(shortcuts);

    return {
        shortcuts,
        showShortcutsModal,
        setShowShortcutsModal,
    };
}
