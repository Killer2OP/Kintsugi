"use client";

import * as React from "react";

export interface Notification {
    id: string;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
    timestamp: Date;
    read: boolean;
    action?: {
        label: string;
        href: string;
    };
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    removeNotification: (id: string) => void;
    clearAll: () => void;
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = "cicd-fixer-notifications";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = React.useState<Notification[]>([]);

    // Load notifications from localStorage
    React.useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setNotifications(
                    parsed.map((n: any) => ({
                        ...n,
                        timestamp: new Date(n.timestamp),
                    }))
                );
            }
        } catch (e) {
            console.error("Failed to load notifications:", e);
        }
    }, []);

    // Save notifications to localStorage
    React.useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
        } catch (e) {
            console.error("Failed to save notifications:", e);
        }
    }, [notifications]);

    const unreadCount = React.useMemo(
        () => notifications.filter((n) => !n.read).length,
        [notifications]
    );

    const addNotification = React.useCallback(
        (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
            const newNotification: Notification = {
                ...notification,
                id: crypto.randomUUID(),
                timestamp: new Date(),
                read: false,
            };
            setNotifications((prev) => [newNotification, ...prev].slice(0, 50)); // Keep max 50
        },
        []
    );

    const markAsRead = React.useCallback((id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    }, []);

    const markAllAsRead = React.useCallback(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }, []);

    const removeNotification = React.useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const clearAll = React.useCallback(() => {
        setNotifications([]);
    }, []);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                addNotification,
                markAsRead,
                markAllAsRead,
                removeNotification,
                clearAll,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = React.useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
}
