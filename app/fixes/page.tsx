"use client";

import React, { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    CheckCircle,
    XCircle,
    Clock,
    GitBranch,
    ExternalLink,
    Loader2,
    AlertTriangle,
    TrendingUp,
    RefreshCw,
} from "lucide-react";
import { useFixes } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { Fix } from "@/lib/types";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface FixStatistics {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    applied: number;
    avgConfidence: number;
    successRate: number;
}

export default function FixesPage() {
    const [loadingStates, setLoadingStates] = useState<
        Record<
            string,
            {
                approve?: boolean;
                reject?: boolean;
                apply?: boolean;
            }
        >
    >({});
    const [reviewComment, setReviewComment] = useState("");
    const [selectedFix, setSelectedFix] = useState<string | null>(null);
    const { fixes: apiFixes, error, isLoading: loading, refresh } = useFixes();

    const statistics = React.useMemo(() => {
        if (!apiFixes || apiFixes.length === 0) {
            return {
                total: 0,
                pending: 0,
                approved: 0,
                rejected: 0,
                applied: 0,
                avgConfidence: 0,
                successRate: 0,
            };
        }

        const stats = apiFixes.reduce(
            (acc: FixStatistics, fix: Fix) => {
                acc.total++;

                const mappedStatus = (() => {
                    switch (fix.status) {
                        case "pending":
                            return "pending";
                        case "approved":
                        case "applying":
                            return "approved";
                        case "rejected":
                        case "application_failed":
                        case "approved_application_failed":
                            return "rejected";
                        case "applied":
                            return "applied";
                        default:
                            return "pending";
                    }
                })();

                acc[
                    mappedStatus as keyof Pick<
                        FixStatistics,
                        "pending" | "approved" | "rejected" | "applied"
                    >
                ]++;
                acc.avgConfidence += fix.confidence_score || 0;
                return acc;
            },
            {
                total: 0,
                pending: 0,
                approved: 0,
                rejected: 0,
                applied: 0,
                avgConfidence: 0,
                successRate: 0,
            }
        );

        if (stats.total > 0) {
            stats.avgConfidence = stats.avgConfidence / stats.total;
            stats.successRate =
                ((stats.approved + stats.applied) / stats.total) * 100;
        }

        return stats;
    }, [apiFixes]);

    const fixes = apiFixes || [];

    const handleApplyFix = async (fixId: string) => {
        setLoadingStates((prev) => ({
            ...prev,
            [fixId]: { ...prev[fixId], apply: true },
        }));
        try {
            await api.applyFix(fixId);
            refresh();
            toast.success("Fix has been applied successfully!");
        } catch (error) {
            console.error("Error applying fix:", error);
            toast.error("Failed to apply fix");
        } finally {
            setLoadingStates((prev) => ({
                ...prev,
                [fixId]: { ...prev[fixId], apply: false },
            }));
        }
    };

    const handleApprove = async (fixId: string) => {
        setLoadingStates((prev) => ({
            ...prev,
            [fixId]: { ...prev[fixId], approve: true },
        }));
        try {
            await api.approveFix(fixId, reviewComment);
            refresh();
            setReviewComment("");
            setSelectedFix(null);
            toast.success("Fix approved successfully!");
        } catch (error) {
            console.error("Error approving fix:", error);
            toast.error("Failed to approve fix");
        } finally {
            setLoadingStates((prev) => ({
                ...prev,
                [fixId]: { ...prev[fixId], approve: false },
            }));
        }
    };

    const handleReject = async (fixId: string) => {
        setLoadingStates((prev) => ({
            ...prev,
            [fixId]: { ...prev[fixId], reject: true },
        }));
        try {
            await api.rejectFix(fixId, reviewComment);
            refresh();
            setReviewComment("");
            setSelectedFix(null);
            toast.success("Fix rejected successfully!");
        } catch (error) {
            console.error("Error rejecting fix:", error);
            toast.error("Failed to reject fix");
        } finally {
            setLoadingStates((prev) => ({
                ...prev,
                [fixId]: { ...prev[fixId], reject: false },
            }));
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "approved":
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "rejected":
                return <XCircle className="h-4 w-4 text-red-500" />;
            case "applied":
                return <CheckCircle className="h-4 w-4 text-blue-500" />;
            case "applying":
                return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
            case "application_failed":
            case "approved_application_failed":
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-yellow-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            pending: "secondary",
            approved: "default",
            rejected: "destructive",
            applied: "default",
        } as const;

        return (
            <Badge
                variant={
                    variants[status as keyof typeof variants] || "secondary"
                }
            >
                {getStatusIcon(status)}
                <span className="ml-1 capitalize">{status}</span>
            </Badge>
        );
    };

    const getConfidenceColor = (score: number) => {
        if (score >= 0.8) return "text-green-600";
        if (score >= 0.6) return "text-yellow-600";
        return "text-red-600";
    };

    if (loading) {
        return (
            <SidebarProvider
                style={
                    {
                        "--sidebar-width": "calc(var(--spacing) * 72)",
                        "--header-height": "calc(var(--spacing) * 12)",
                    } as React.CSSProperties
                }
            >
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <SiteHeader />
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold">
                                Fix Management
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground">
                                Review and approve AI-generated fixes for CI/CD
                                failures
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            <div className="text-xs text-muted-foreground">
                                Last updated: {new Date().toLocaleTimeString()}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => refresh()}
                                disabled={loading}
                                className="flex items-center gap-2 w-full sm:w-auto"
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${
                                        loading ? "animate-spin" : ""
                                    }`}
                                />
                                Refresh
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Fixes
                                </CardTitle>
                                <GitBranch className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {statistics.total}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Pending Review
                                </CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {statistics.pending}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Success Rate
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {statistics.successRate.toFixed(1)}%
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Avg Confidence
                                </CardTitle>
                                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {(statistics.avgConfidence * 100).toFixed(
                                        1
                                    )}
                                    %
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {error && (
                        <Card className="border-red-200">
                            <CardContent className="pt-6">
                                <div className="flex items-center space-x-2 text-red-600">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span>Error loading fixes: {error}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="space-y-4">
                        {fixes.length === 0 ? (
                            <Card>
                                <CardContent className="pt-6 text-center">
                                    <div className="space-y-3">
                                        <GitBranch className="h-12 w-12 text-muted-foreground mx-auto" />
                                        <div>
                                            <p className="text-muted-foreground font-medium">
                                                No fixes available for review
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                All fixes have been processed or
                                                no new CI/CD failures detected
                                            </p>
                                        </div>
                                        <div className="flex justify-center gap-2 mt-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => refresh()}
                                                disabled={loading}
                                            >
                                                <RefreshCw
                                                    className={`h-4 w-4 mr-2 ${
                                                        loading
                                                            ? "animate-spin"
                                                            : ""
                                                    }`}
                                                />
                                                Check for Updates
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            fixes.map((fix) => (
                                <Card key={fix.id} className="relative">
                                    <CardHeader className="pb-3">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex items-center space-x-2">
                                                <CardTitle className="text-base sm:text-lg">
                                                    Fix #
                                                    {String(fix.id).slice(0, 8)}
                                                </CardTitle>
                                                {getStatusBadge(fix.status)}
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 text-sm text-muted-foreground">
                                                {fix.confidence_score && (
                                                    <span
                                                        className={getConfidenceColor(
                                                            fix.confidence_score
                                                        )}
                                                    >
                                                        Confidence:{" "}
                                                        {(
                                                            fix.confidence_score *
                                                            100
                                                        ).toFixed(1)}
                                                        %
                                                    </span>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                    className="w-fit"
                                                >
                                                    <a
                                                        href={`https://github.com/${fix.repository}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                        <CardDescription className="text-xs sm:text-sm">
                                            Repository: {fix.repository}
                                            {fix.workflow_name &&
                                                ` | Workflow: ${fix.workflow_name}`}
                                            {fix.fix_complexity &&
                                                ` | Complexity: ${fix.fix_complexity}`}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="space-y-3 sm:space-y-4">
                                        <div>
                                            <h4 className="font-semibold mb-2 text-sm sm:text-base">
                                                Proposed Fix:
                                            </h4>
                                            <pre className="bg-muted p-2 sm:p-3 rounded-md text-xs sm:text-sm overflow-x-auto whitespace-pre-wrap">
                                                {fix.suggested_fix ||
                                                    fix.description ||
                                                    "No fix details available"}
                                            </pre>
                                        </div>

                                        {(fix.status === "applied" ||
                                            fix.status === "applying" ||
                                            fix.status ===
                                                "application_failed" ||
                                            fix.status ===
                                                "approved_application_failed") && (
                                            <div className="space-y-3 border-t pt-4">
                                                <h4 className="font-semibold mb-2">
                                                    Application Status:
                                                </h4>
                                                <div className="space-y-2">
                                                    {fix.pr_url && (
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-sm font-medium">
                                                                Pull Request:
                                                            </span>
                                                            <a
                                                                href={
                                                                    fix.pr_url
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-800 underline text-sm"
                                                            >
                                                                View PR →
                                                            </a>
                                                        </div>
                                                    )}
                                                    {fix.fix_branch && (
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-sm font-medium">
                                                                Branch:
                                                            </span>
                                                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                                                {fix.fix_branch}
                                                            </code>
                                                        </div>
                                                    )}
                                                    {fix.fix_error && (
                                                        <div className="flex items-start space-x-2">
                                                            <span className="text-sm font-medium text-red-600">
                                                                Error:
                                                            </span>
                                                            <span className="text-sm text-red-600">
                                                                {fix.fix_error}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {(fix.status === "pending" ||
                                            fix.status ===
                                                "pending_approval") && (
                                            <div className="space-y-3 border-t pt-4">
                                                <div>
                                                    <label className="text-sm font-medium">
                                                        Review Comment
                                                        (Optional)
                                                    </label>
                                                    <Textarea
                                                        value={
                                                            selectedFix ===
                                                            fix.id
                                                                ? reviewComment
                                                                : ""
                                                        }
                                                        onChange={(e) => {
                                                            setReviewComment(
                                                                e.target.value
                                                            );
                                                            setSelectedFix(
                                                                fix.id
                                                            );
                                                        }}
                                                        placeholder="Add your review comments..."
                                                        className="mt-1"
                                                    />
                                                </div>

                                                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleReject(fix.id)
                                                        }
                                                        disabled={
                                                            loadingStates[
                                                                fix.id
                                                            ]?.approve ||
                                                            loadingStates[
                                                                fix.id
                                                            ]?.reject
                                                        }
                                                        size="sm"
                                                        className="w-full sm:w-auto sm:min-w-[120px] border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-300"
                                                    >
                                                        {loadingStates[fix.id]
                                                            ?.reject ? (
                                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        ) : (
                                                            <XCircle className="h-4 w-4 mr-2" />
                                                        )}
                                                        Reject
                                                    </Button>

                                                    <Button
                                                        onClick={() =>
                                                            handleApprove(
                                                                fix.id
                                                            )
                                                        }
                                                        disabled={
                                                            loadingStates[
                                                                fix.id
                                                            ]?.approve ||
                                                            loadingStates[
                                                                fix.id
                                                            ]?.reject
                                                        }
                                                        size="sm"
                                                        className="w-full sm:w-auto sm:min-w-[120px] bg-green-600 hover:bg-green-700 text-white"
                                                    >
                                                        {loadingStates[fix.id]
                                                            ?.approve ? (
                                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        ) : (
                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                        )}
                                                        Approve
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {fix.status === "approved" && (
                                            <div className="space-y-3 border-t pt-4">
                                                <div className="flex justify-end">
                                                    <Button
                                                        onClick={() =>
                                                            handleApplyFix(
                                                                fix.id
                                                            )
                                                        }
                                                        disabled={
                                                            loadingStates[
                                                                fix.id
                                                            ]?.apply
                                                        }
                                                        size="lg"
                                                        className="min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white"
                                                    >
                                                        {loadingStates[fix.id]
                                                            ?.apply ? (
                                                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                                        ) : (
                                                            <GitBranch className="h-5 w-5 mr-2" />
                                                        )}
                                                        Apply Fix
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="text-xs text-muted-foreground flex justify-between">
                                            <span>
                                                Created:{" "}
                                                {new Date(
                                                    fix.created_at
                                                ).toLocaleString()}
                                            </span>
                                            <span>Status: {fix.status}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
