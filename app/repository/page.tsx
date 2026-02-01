"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useFailures, useRepositoryAnalytics } from "@/hooks/use-api";
import {
    GitBranch,
    AlertTriangle,
    CheckCircle,
    ExternalLink,
    Activity,
    TrendingDown,
    Eye,
} from "lucide-react";

function RepositoryDetailModal({
    owner,
    repo,
}: {
    owner: string;
    repo: string;
}) {
    const { profile, isLoading, error } = useRepositoryAnalytics(owner, repo);

    if (isLoading) {
        return (
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Loading Repository Analytics</DialogTitle>
                    <DialogDescription>
                        Loading analytics for {owner}/{repo}...
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        {[...Array(3)].map((_, i) => (
                            <Card key={i}>
                                <CardHeader>
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-8 w-12" />
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>
            </DialogContent>
        );
    }

    if (error || !profile) {
        return (
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="text-destructive">
                        Error Loading Analytics
                    </DialogTitle>
                    <DialogDescription>
                        Unable to load analytics for {owner}/{repo}
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        );
    }

    return (
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5" />
                    {owner}/{repo}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            window.open(
                                `https://github.com/${owner}/${repo}`,
                                "_blank"
                            )
                        }
                    >
                        <ExternalLink className="h-4 w-4" />
                    </Button>
                </DialogTitle>
                <DialogDescription>
                    Detailed workflow analytics and failure patterns
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Runs
                            </CardTitle>
                            <Activity className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {profile.total_runs || 0}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Success Rate
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`text-2xl font-bold ${
                                    profile.success_rate === 0
                                        ? "text-red-600"
                                        : "text-green-600"
                                }`}
                            >
                                {profile.success_rate !== undefined
                                    ? `${Math.round(
                                          profile.success_rate * 100
                                      )}%`
                                    : "N/A"}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Most Failing
                            </CardTitle>
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-bold text-red-600">
                                {profile.most_failing_workflows &&
                                Object.keys(profile.most_failing_workflows)
                                    .length > 0
                                    ? Object.keys(
                                          profile.most_failing_workflows
                                      )[0]
                                          ?.replace(/🔴\s*/, "")
                                          .split(" ")
                                          .slice(-2)
                                          .join(" ")
                                    : "None"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {profile.most_failing_workflows &&
                                Object.values(profile.most_failing_workflows)[0]
                                    ? `${
                                          Object.values(
                                              profile.most_failing_workflows
                                          )[0]
                                      } failures`
                                    : ""}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {profile.most_failing_workflows &&
                    Object.keys(profile.most_failing_workflows).length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Workflow Failure Breakdown
                                </CardTitle>
                                <CardDescription>
                                    Workflows with the most failures in this
                                    repository
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {Object.entries(
                                        profile.most_failing_workflows
                                    ).map(([workflow, count]) => (
                                        <div
                                            key={workflow}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                                <span className="text-sm font-medium">
                                                    {workflow.replace(
                                                        /🔴\s*/,
                                                        ""
                                                    )}
                                                </span>
                                            </div>
                                            <span className="text-sm text-red-600 font-bold">
                                                {count} failures
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                {profile.recommendations &&
                    profile.recommendations.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>AI Recommendations</CardTitle>
                                <CardDescription>
                                    Suggested improvements for this repository
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {profile.recommendations.map(
                                        (
                                            recommendation: string,
                                            index: number
                                        ) => (
                                            <div
                                                key={index}
                                                className="flex items-start gap-2"
                                            >
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0" />
                                                <p className="text-sm text-muted-foreground">
                                                    {recommendation}
                                                </p>
                                            </div>
                                        )
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
            </div>
        </DialogContent>
    );
}

export default function RepositoryAnalyticsPage() {
    const { failures, isLoading } = useFailures();

    const repositories = failures.reduce((acc, failure) => {
        const repoKey = `${failure.owner}/${failure.repo_name}`;
        if (!acc.find((r) => r.key === repoKey)) {
            acc.push({
                key: repoKey,
                owner: failure.owner,
                repo: failure.repo_name,

                failureCount: failures.filter(
                    (f) =>
                        f.owner === failure.owner &&
                        f.repo_name === failure.repo_name
                ).length,

                lastFailure: failures
                    .filter(
                        (f) =>
                            f.owner === failure.owner &&
                            f.repo_name === failure.repo_name
                    )
                    .sort(
                        (a, b) =>
                            new Date(b.created_at).getTime() -
                            new Date(a.created_at).getTime()
                    )[0]?.created_at,
            });
        }
        return acc;
    }, [] as Array<{ key: string; owner: string; repo: string; failureCount: number; lastFailure: string }>);

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
                <div className="flex-1 p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                            Repository Analytics
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground">
                            Monitor workflow performance and failure patterns
                            across your tracked repositories
                        </p>
                    </div>

                    {isLoading && (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {[...Array(3)].map((_, i) => (
                                <Card key={i}>
                                    <CardHeader>
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-4 w-48" />
                                    </CardHeader>
                                    <CardContent>
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-8 w-16 mt-2" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {!isLoading && repositories.length > 0 && (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {repositories.map((repo) => (
                                <Card
                                    key={repo.key}
                                    className="hover:shadow-md transition-shadow"
                                >
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <GitBranch className="h-4 w-4" />
                                                <CardTitle className="text-base">
                                                    {repo.owner}
                                                </CardTitle>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    window.open(
                                                        `https://github.com/${repo.owner}/${repo.repo}`,
                                                        "_blank"
                                                    )
                                                }
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <CardDescription className="font-medium">
                                            {repo.repo}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Failures
                                                    </p>
                                                    <p className="text-lg font-bold text-red-600">
                                                        {repo.failureCount}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Last Failure
                                                    </p>
                                                    <p className="text-xs">
                                                        {repo.lastFailure
                                                            ? new Date(
                                                                  repo.lastFailure
                                                              ).toLocaleDateString()
                                                            : "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    className="w-full"
                                                    variant="outline"
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Analytics
                                                </Button>
                                            </DialogTrigger>
                                            <RepositoryDetailModal
                                                owner={repo.owner}
                                                repo={repo.repo}
                                            />
                                        </Dialog>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {!isLoading && repositories.length === 0 && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-8">
                                    <GitBranch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium mb-2">
                                        No Repositories Found
                                    </h3>
                                    <p className="text-muted-foreground">
                                        No repositories are currently being
                                        tracked. Set up webhooks on your GitHub
                                        repositories to start monitoring workflow
                                        failures.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
