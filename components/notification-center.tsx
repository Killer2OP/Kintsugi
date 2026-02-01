"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications, Notification } from "@/components/notification-context";
import {
    Bell,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Info,
    Check,
    Trash2,
    ExternalLink,
} from "lucide-react";

const iconMap = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const colorMap = {
    success: "text-emerald-500",
    error: "text-red-500",
    warning: "text-amber-500",
    info: "text-blue-500",
};

const bgMap = {
    success: "bg-emerald-50 dark:bg-emerald-500/10",
    error: "bg-red-50 dark:bg-red-500/10",
    warning: "bg-amber-50 dark:bg-amber-500/10",
    info: "bg-blue-50 dark:bg-blue-500/10",
};

function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

function NotificationItem({
    notification,
    onMarkAsRead,
    onRemove,
}: {
    notification: Notification;
    onMarkAsRead: () => void;
    onRemove: () => void;
}) {
    const Icon = iconMap[notification.type];

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`relative p-3 rounded-lg border transition-all ${
                notification.read
                    ? "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800"
                    : `${bgMap[notification.type]} border-transparent`
            }`}
        >
            <div className="flex gap-3">
                <div className={`mt-0.5 ${colorMap[notification.type]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm text-zinc-900 dark:text-white">
                            {notification.title}
                        </p>
                        <span className="text-xs text-zinc-400 whitespace-nowrap">
                            {formatRelativeTime(notification.timestamp)}
                        </span>
                    </div>
                    {notification.message && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5 line-clamp-2">
                            {notification.message}
                        </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                        {!notification.read && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onMarkAsRead}
                                className="h-7 px-2 text-xs"
                            >
                                <Check className="w-3 h-3 mr-1" />
                                Mark as read
                            </Button>
                        )}
                        {notification.action && (
                            <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="h-7 px-2 text-xs"
                            >
                                <Link href={notification.action.href}>
                                    {notification.action.label}
                                    <ExternalLink className="w-3 h-3 ml-1" />
                                </Link>
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onRemove}
                            className="h-7 px-2 text-xs text-zinc-400 hover:text-red-500 ml-auto"
                        >
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </div>
                </div>
            </div>
            {!notification.read && (
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-500" />
            )}
        </motion.div>
    );
}

export function NotificationCenter() {
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
    } = useNotifications();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-red-500 border-2 border-white dark:border-zinc-900">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className="w-96 p-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-zinc-200 dark:border-zinc-800"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-zinc-900 dark:text-white">
                            Notifications
                        </h3>
                        {unreadCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                                {unreadCount} new
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllAsRead}
                                className="h-7 text-xs"
                            >
                                Mark all read
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearAll}
                                className="h-7 text-xs text-zinc-400 hover:text-red-500"
                            >
                                Clear all
                            </Button>
                        )}
                    </div>
                </div>

                {/* Notification List */}
                <div className="max-h-96 overflow-y-auto p-2 space-y-2">
                    <AnimatePresence mode="popLayout">
                        {notifications.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-12 text-center"
                            >
                                <Bell className="w-10 h-10 mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
                                <p className="text-sm text-zinc-500">
                                    No notifications yet
                                </p>
                                <p className="text-xs text-zinc-400 mt-1">
                                    You&apos;ll see updates here
                                </p>
                            </motion.div>
                        ) : (
                            notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onMarkAsRead={() => markAsRead(notification.id)}
                                    onRemove={() => removeNotification(notification.id)}
                                />
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </PopoverContent>
        </Popover>
    );
}
