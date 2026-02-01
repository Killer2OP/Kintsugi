"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    RefreshCw,
    CheckCircle,
    AlertCircle,
    XCircle,
    Server,
    Database,
    Bot,
} from "lucide-react";
import { useHealth } from "@/hooks/use-api";
import { cn } from "@/lib/utils";

export function SystemStatusBanner() {
    const { health, isLoading, refresh, isHealthy } = useHealth();

    const getServiceIcon = (service: string) => {
        switch (service) {
            case "database":
                return (
                    <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                );
            case "github_api":
                return (
                    <Server className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                );
            case "gemini_api":
                return (
                    <Bot className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                );
            default:
                return (
                    <CheckCircle className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                );
        }
    };

    const getServiceStatus = (status: string) => {
        switch (status) {
            case "connected":
            case "available":
            case "healthy":
                return (
                    <Badge
                        variant="outline"
                        className="border-green-500 text-green-700 bg-green-50 dark:border-green-400 dark:text-green-300 dark:bg-green-950/30 text-xs"
                    >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Online
                    </Badge>
                );
            case "degraded":
                return (
                    <Badge
                        variant="outline"
                        className="border-yellow-500 text-yellow-700 bg-yellow-50 dark:border-yellow-400 dark:text-yellow-300 dark:bg-yellow-950/30 text-xs"
                    >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Degraded
                    </Badge>
                );
            default:
                return (
                    <Badge
                        variant="outline"
                        className="border-red-500 text-red-700 bg-red-50 dark:border-red-400 dark:text-red-300 dark:bg-red-950/30 text-xs"
                    >
                        <XCircle className="h-3 w-3 mr-1" />
                        Offline
                    </Badge>
                );
        }
    };

    if (isLoading) {
        return (
            <Card className="mb-4">
                <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">
                            Checking system status...
                        </span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card
            className={cn(
                "mb-4",
                isHealthy
                    ? "border-green-200 bg-green-50/30 dark:border-green-800 dark:bg-green-950/20"
                    : "border-red-200 bg-red-50/30 dark:border-red-800 dark:bg-red-950/20"
            )}
        >
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            {isHealthy ? (
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            )}
                            <span className="font-medium text-sm">
                                System Status:
                            </span>
                            <Badge
                                variant={isHealthy ? "outline" : "destructive"}
                                className={
                                    isHealthy
                                        ? "border-green-500 text-green-700 bg-green-50 dark:border-green-400 dark:text-green-300 dark:bg-green-950/30"
                                        : ""
                                }
                            >
                                {health?.status || "Unknown"}
                            </Badge>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => refresh()}
                        disabled={isLoading}
                        className="gap-2 hover:bg-white/50 dark:hover:bg-gray-800/50"
                    >
                        <RefreshCw
                            className={cn(
                                "h-4 w-4",
                                isLoading && "animate-spin"
                            )}
                        />
                        Refresh
                    </Button>
                </div>

                {health?.services && (
                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Object.entries(health.services).map(
                                ([service, status]) => (
                                    <div
                                        key={service}
                                        className="flex items-center justify-between p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700"
                                    >
                                        <div className="flex items-center gap-2">
                                            {getServiceIcon(service)}
                                            <span className="text-sm font-medium capitalize">
                                                {service === "github_api"
                                                    ? "GitHub API"
                                                    : service === "gemini_api"
                                                    ? "Gemini AI"
                                                    : service === "database"
                                                    ? "Database"
                                                    : service.replace("_", " ")}
                                            </span>
                                        </div>
                                        {getServiceStatus(status as string)}
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
