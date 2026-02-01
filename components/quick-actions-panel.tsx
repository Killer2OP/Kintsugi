"use client";

import * as React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Zap,
    RefreshCw,
    Play,
    Search,
    Settings,
    Download,
    TestTube,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface QuickAction {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    action: () => Promise<void> | void;
    variant: "default" | "destructive" | "outline" | "secondary";
    badge?: string;
}

export function QuickActionsPanel() {
    const [loadingActions, setLoadingActions] = React.useState<Set<string>>(
        new Set()
    );

    const setActionLoading = (actionId: string, loading: boolean) => {
        setLoadingActions((prev) => {
            const next = new Set(prev);
            if (loading) {
                next.add(actionId);
            } else {
                next.delete(actionId);
            }
            return next;
        });
    };

    const quickActions: QuickAction[] = [
        {
            id: "manual-scan",
            title: "Manual Repository Scan",
            description: "Trigger immediate scan for new failures",
            icon: Search,
            action: async () => {
                setActionLoading("manual-scan", true);
                try {
                    await api.triggerManualScan();
                    toast.success("Manual scan triggered successfully!");
                } catch (error) {
                    toast.error("Failed to trigger manual scan");
                    console.error(error);
                } finally {
                    setActionLoading("manual-scan", false);
                }
            },
            variant: "default",
            badge: "Instant",
        },
        {
            id: "force-refresh",
            title: "Force Data Refresh",
            description: "Refresh all dashboard data",
            icon: RefreshCw,
            action: () => {
                window.location.reload();
            },
            variant: "outline",
        },
        {
            id: "test-webhook",
            title: "Test Webhook",
            description: "Send test webhook to verify connectivity",
            icon: TestTube,
            action: async () => {
                setActionLoading("test-webhook", true);
                try {
                    await api.testWebhook();
                    toast.success("Webhook test completed successfully!");
                } catch (error) {
                    toast.error("Webhook test failed");
                    console.error(error);
                } finally {
                    setActionLoading("test-webhook", false);
                }
            },
            variant: "secondary",
            badge: "Test",
        },
        {
            id: "run-gemini",
            title: "Force Gemini Analysis",
            description: "Manually trigger AI analysis on pending failures",
            icon: Zap,
            action: async () => {
                setActionLoading("run-gemini", true);
                try {
                    await api.forceGeminiAnalysis();
                    toast.success("Gemini analysis triggered successfully!");
                } catch (error) {
                    toast.error("Failed to trigger Gemini analysis");
                    console.error(error);
                } finally {
                    setActionLoading("run-gemini", false);
                }
            },
            variant: "default",
            badge: "AI",
        },
        {
            id: "export-data",
            title: "Export Analytics",
            description: "Download failure and fix analytics as CSV",
            icon: Download,
            action: async () => {
                setActionLoading("export-data", true);
                try {
                    const blob = await api.exportAnalytics();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `ci-cd-analytics-${
                        new Date().toISOString().split("T")[0]
                    }.csv`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    toast.success("Analytics exported successfully!");
                } catch (error) {
                    toast.error("Failed to export analytics");
                    console.error(error);
                } finally {
                    setActionLoading("export-data", false);
                }
            },
            variant: "outline",
        },
        {
            id: "configure",
            title: "System Configuration",
            description: "Configure agent settings and thresholds",
            icon: Settings,
            action: () => {
                toast.info("Configuration panel coming soon!");
            },
            variant: "secondary",
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Quick Actions
                </CardTitle>
                <CardDescription>
                    Common actions and manual triggers for Kintsugi
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <Button
                                key={action.id}
                                variant={action.variant}
                                className="h-auto p-4 justify-start w-full"
                                onClick={action.action}
                                disabled={loadingActions.has(action.id)}
                            >
                                <div className="flex items-start gap-3 text-left w-full">
                                    <Icon
                                        className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                                            loadingActions.has(action.id)
                                                ? "animate-spin"
                                                : ""
                                        }`}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-medium text-sm">
                                                {action.title}
                                            </p>
                                            {action.badge && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs px-2 py-0 border border-gray-300 text-gray-600 bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:bg-gray-800"
                                                >
                                                    {action.badge}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs opacity-80">
                                            {loadingActions.has(action.id)
                                                ? "Processing..."
                                                : action.description}
                                        </p>
                                    </div>
                                </div>
                            </Button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
