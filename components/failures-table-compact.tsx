"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFailures } from "@/hooks/use-api";
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    ExternalLink,
    GitBranch,
    RefreshCw,
} from "lucide-react";

export function FailuresTableCompact() {
    const { failures, totalCount, isLoading, error, refresh } = useFailures({
        limit: 5, // Limit for dashboard view
    });

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60)
        );

        if (diffInMinutes < 60) {
            return `${diffInMinutes}m ago`;
        } else if (diffInMinutes < 1440) {
            return `${Math.floor(diffInMinutes / 60)}h ago`;
        } else {
            return `${Math.floor(diffInMinutes / 1440)}d ago`;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return (
                    <Badge
                        variant="outline"
                        className="text-orange-600 border-orange-200"
                    >
                        Pending
                    </Badge>
                );
            case "generated":
                return (
                    <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300"
                    >
                        Fix Generated
                    </Badge>
                );
            case "approved":
                return (
                    <Badge
                        variant="default"
                        className="bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300"
                    >
                        Approved
                    </Badge>
                );
            case "rejected":
                return <Badge variant="destructive">Rejected</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "generated":
                return (
                    <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400" />
                );
            case "pending":
                return (
                    <Clock className="h-3 w-3 text-yellow-500 dark:text-yellow-400" />
                );
            case "approved":
                return (
                    <CheckCircle className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                );
            case "rejected":
                return (
                    <AlertTriangle className="h-3 w-3 text-red-500 dark:text-red-400" />
                );
            default:
                return <AlertTriangle className="h-3 w-3 text-gray-500" />;
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GitBranch className="h-5 w-5" />
                        Recent Failures
                    </CardTitle>
                    <CardDescription>
                        Loading recent workflow failures...
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center space-x-4"
                            >
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-4 w-[150px]" />
                                <Skeleton className="h-4 w-[80px]" />
                                <Skeleton className="h-4 w-[60px]" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Failed to Load Failures
                    </CardTitle>
                    <CardDescription>
                        Unable to fetch workflow failures from the backend API
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={() => refresh()}
                        variant="outline"
                        size="sm"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <GitBranch className="h-5 w-5" />
                            Recent Failures
                        </CardTitle>
                        <CardDescription>
                            {totalCount} total failures tracked
                        </CardDescription>
                    </div>
                    <Button onClick={() => refresh()} variant="ghost" size="sm">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {failures.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                        <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No recent failures</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {failures.slice(0, 5).map((failure) => (
                            <div
                                key={failure.id}
                                className="flex items-center justify-between p-3 rounded-lg border bg-card"
                            >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    {getStatusIcon(failure.status)}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm truncate">
                                                {failure.owner}/
                                                {failure.repo_name}
                                            </span>
                                            {getStatusBadge(failure.fix_status)}
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {failure.workflow_name}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-xs text-muted-foreground">
                                        {formatTimeAgo(failure.created_at)}
                                    </span>
                                    <Button variant="ghost" size="sm" asChild>
                                        <a
                                            href={`https://github.com/${failure.owner}/${failure.repo_name}/actions/runs/${failure.run_id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {/* View All Link */}
                        <div className="pt-2 border-t">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full"
                                asChild
                            >
                                <a href="/failures">
                                    View All Failures ({totalCount})
                                </a>
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
